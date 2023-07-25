import {useAtom} from 'jotai';
import fileDownload from 'js-file-download';
import urls from 'lib/urls';
import {
  deleteTranscription,
  downloadFiles,
  resetTranscriptions,
  transcribe,
} from 'lib/api/transcribe';
import colours from 'lib/colours';
import React, {useState} from 'react';
import {
  AlertCircle,
  Download,
  Check,
  Loader,
  Play,
  Trash2,
  Eye,
} from 'lucide-react';
import {transcriptionsAtom} from 'store';
import Transcription, {TranscriptionStatus} from 'types/Transcription';
import DownloadTranscriptionFileButton from './DownloadTranscriptionFileButton';
import Link from 'next/link';
import {Button} from 'components/ui/button';
import DataTable, {Section} from 'components/DataTable';
import ConfirmDelete from 'components/ConfirmDelete';

const DatasetTable: React.FC = () => {
  const [transcriptions, setTranscriptions] = useAtom(transcriptionsAtom);
  const [downloading, setDownloading] = useState(false);

  if (transcriptions.length === 0) {
    return <p>No current transcriptions!</p>;
  }

  const updateTranscription = (transcription: Transcription) => {
    const index = transcriptions.indexOf(transcription);
    setTranscriptions([
      ...transcriptions.slice(0, index),
      transcription,
      ...transcriptions.slice(index + 1),
    ]);
  };

  const _transcribe = async (transcription: Transcription) => {
    transcription.status = TranscriptionStatus.Transcribing;
    updateTranscription(transcription);
    const response = await transcribe(
      transcription.modelLocation,
      transcription.audioName
    );
    if (response.ok) {
      transcription.status = TranscriptionStatus.Finished;
    } else {
      transcription.status = TranscriptionStatus.Error;
      console.error('Could not train transcription!');
    }
    updateTranscription(transcription);
  };

  const readyTranscriptions = transcriptions.filter(
    transcription =>
      ![
        TranscriptionStatus.Transcribing,
        TranscriptionStatus.Finished,
      ].includes(transcription.status)
  );

  const isTranscribing = transcriptions.some(
    transcription => transcription.status === TranscriptionStatus.Transcribing
  );

  const transcribeEverythingAsync = async () => {
    // Group by model and transcribe the first transcription of each model
    // first, to take better advantage of the caching performed by the server.
    // The rest can be transcribed asynchronously
    let groupedByModel: {[key: string]: Transcription[]} = {};
    groupedByModel = readyTranscriptions.reduce((result, transcription) => {
      if (!Object.keys(result).includes(transcription.modelLocation)) {
        return {...result, [transcription.modelLocation]: [transcription]};
      }
      const modelTranscriptions = [
        ...result[transcription.modelLocation],
        transcription,
      ];
      return {...result, [transcription.modelLocation]: modelTranscriptions};
    }, groupedByModel);

    const promises = Object.keys(groupedByModel).map(async modelLocation => {
      await _transcribe(groupedByModel[modelLocation][0]);
      // Can transcribe the rest without waiting now that we've cached the first.
      groupedByModel[modelLocation].slice(1).forEach(_transcribe);
    });
    return await Promise.all(promises);
  };

  const transcribeEverything = async () => {
    for (const transcription of readyTranscriptions) {
      await _transcribe(transcription);
    }
  };

  const removeTranscription = async (index: number) => {
    const transcription = transcriptions[index];
    const response = await deleteTranscription(
      transcription.modelLocation,
      transcription.audioName
    );
    if (response.ok) {
      setTranscriptions([
        ...transcriptions.slice(0, index),
        ...transcriptions.slice(index + 1),
      ]);
    } else {
      console.error('Could not delete transcription with index', index);
    }
  };

  const removeAll = async () => {
    const response = await resetTranscriptions();
    if (response.ok) {
      setTranscriptions([]);
    }
  };

  const downloadAllTranscriptions = async () => {
    if (downloading) return;
    setDownloading(true);
    const response = await downloadFiles();
    if (response.ok) {
      const blob = await response.blob();
      fileDownload(blob, 'transcription_files.zip');
    } else {
      console.error('Error downloading transcription files');
    }
    setDownloading(false);
  };

  const sections: Section<Transcription>[] = [
    {name: 'Model Name', display: transcription => transcription.modelLocation},
    {
      name: 'Audio Name',
      display: transcription => `${transcription.audioName}.wav`,
    },
    {
      name: 'Text',
      display: transcription => (
        <DownloadTranscriptionFileButton
          variant="icon"
          transcription={transcription}
          fileType="text"
        />
      ),
    },
    {
      name: 'Elan',
      display: transcription => (
        <DownloadTranscriptionFileButton
          variant="icon"
          transcription={transcription}
          fileType="elan"
        />
      ),
    },
    {
      name: 'Status',
      display: transcription => transcription.status,
    },

    {
      name: 'Transcribe',
      display: transcription => (
        <button
          onClick={() => _transcribe(transcription)}
          disabled={transcription.status === TranscriptionStatus.Finished}
        >
          <TranscriptionStatusIndicator status={transcription.status} />
        </button>
      ),
    },
    {
      name: 'View',
      display: (_, index) => (
        <Link href={`${urls.transcriptions.view}/${index}`}>
          <a>
            <Eye color={colours.info} />
          </a>
        </Link>
      ),
    },
    {
      name: 'Delete',
      display: (transcription, index) => (
        <ConfirmDelete
          title="Delete transcription?"
          description={`Once deleted, the transcription for ${transcription.audioName}.wav will not be recoverable.`}
          action={() => removeTranscription(index)}
        >
          <button>
            <Trash2 color={colours.delete} />
          </button>
        </ConfirmDelete>
      ),
    },
  ];

  return (
    <>
      <div className="mt-2 text-sm flex justify-between">
        <div className="space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={transcribeEverything}
            disabled={
              isTranscribing ||
              transcriptions.filter(
                transcription =>
                  transcription.status !== TranscriptionStatus.Finished
              ).length === 0
            }
          >
            {isTranscribing ? (
              <Loader className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Transcribe All
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={
              downloading ||
              transcriptions.filter(
                transcription =>
                  transcription.status === TranscriptionStatus.Finished
              ).length === 0
            }
            onClick={downloadAllTranscriptions}
          >
            {downloading ? (
              <Loader className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download All
          </Button>
        </div>
        <ConfirmDelete
          title="Delete all Transcriptions?"
          description="Once deleted, these transcriptions will not be recoverable."
          action={removeAll}
        >
          <Button size="sm" variant="outline">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete All
          </Button>
        </ConfirmDelete>
      </div>
      <div className="text-left w-full">
        <DataTable data={transcriptions} sections={sections} />
      </div>
    </>
  );
};

type IndicatorProps = {
  status: TranscriptionStatus;
};

const TranscriptionStatusIndicator: React.FC<IndicatorProps> = ({status}) => {
  switch (status) {
    case TranscriptionStatus.Waiting:
      return <Play color={colours.start} />;
    case TranscriptionStatus.Transcribing:
      return <Loader color={colours.unavailable} className="animate-spin" />;
    case TranscriptionStatus.Finished:
      return <Check color={colours.grey} />;
    case TranscriptionStatus.Error:
      return <AlertCircle color={colours.error} />;
  }
};

export default DatasetTable;
