import {useAtom} from 'jotai';
import fileDownload from 'js-file-download';
import {
  deleteTranscription,
  downloadFiles,
  resetTranscriptions,
  transcribe,
} from 'lib/api/transcribe';
import colours from 'lib/colours';
import React from 'react';
import {AlertCircle, Check, Loader, Play, Trash2} from 'react-feather';
import {transcriptionsAtom} from 'store';
import Transcription, {TranscriptionStatus} from 'types/Transcription';
import DownloadTranscriptionFileButton from './DownloadTranscriptionFileButton';

const DatasetTable: React.FC = () => {
  const [transcriptions, setTranscriptions] = useAtom(transcriptionsAtom);

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

  const transcribeEverything = async () => {
    const readyTranscriptions = transcriptions.filter(
      transcription =>
        ![
          TranscriptionStatus.Transcribing,
          TranscriptionStatus.Finished,
        ].includes(transcription.status)
    );

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
    const response = await downloadFiles();
    if (response.ok) {
      const blob = await response.blob();
      fileDownload(blob, 'transcription_files.zip');
    } else {
      console.error('Error downloading transcription files');
    }
  };

  return (
    <>
      <div className="mt-2 text-sm flex justify-between">
        <button
          className="button"
          disabled={
            transcriptions.filter(
              transcription =>
                transcription.status === TranscriptionStatus.Finished
            ).length === 0
          }
          onClick={downloadAllTranscriptions}
        >
          Download All Transcriptions
        </button>
        <div className="space-x-2">
          <button
            className="button"
            onClick={transcribeEverything}
            disabled={
              transcriptions.filter(
                transcription =>
                  transcription.status !== TranscriptionStatus.Finished
              ).length === 0
            }
          >
            Transcribe All
          </button>
          <button className="button" onClick={removeAll}>
            Delete All
          </button>
        </div>
      </div>
      <div className="text-left w-full">
        <table className="w-full table">
          <thead>
            <tr>
              <th>Model Name</th>
              <th>Audio</th>
              <th>Text</th>
              <th>Elan</th>
              <th>Status</th>
              <th>Transcribe</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {transcriptions.map((transcription, index) => (
              <tr key={index}>
                <td>{transcription.modelLocation}</td>
                <td>{transcription.audioName}.wav</td>

                <td>
                  <DownloadTranscriptionFileButton
                    transcription={transcription}
                    fileType="text"
                  />
                </td>
                <td>
                  <DownloadTranscriptionFileButton
                    transcription={transcription}
                    fileType="elan"
                  />
                </td>

                <td>{transcription.status}</td>
                <td>
                  <button
                    onClick={() => _transcribe(transcription)}
                    disabled={
                      transcription.status === TranscriptionStatus.Finished
                    }
                  >
                    <TranscriptionStatusIndicator
                      status={transcription.status}
                    />
                  </button>
                </td>
                <td>
                  <button onClick={() => removeTranscription(index)}>
                    <Trash2 color={colours.delete} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
