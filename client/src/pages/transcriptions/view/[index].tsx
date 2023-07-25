import DownloadTranscriptionFileButton from 'components/transcribe/DownloadTranscriptionFileButton';
import {useAtom} from 'jotai';
import {getText} from 'lib/api/transcribe';
import urls from 'lib/urls';
import Link from 'next/link';
import {useRouter} from 'next/router';
import React, {FC, useEffect, useState} from 'react';
import {Dot, Download, FileAudio2, FileBox, Home, Icon} from 'lucide-react';
import {transcriptionsAtom} from 'store';
import Transcription, {TranscriptionStatus} from 'types/Transcription';
import {Button} from 'components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from 'components/ui/card';
import {Label} from 'components/ui/label';

export default function ViewTranscriptionPage() {
  const [transcriptions] = useAtom(transcriptionsAtom);
  const router = useRouter();
  const {index} = router.query;

  const getTranscription = (): Transcription | undefined => {
    if (!index) return;
    let numberedIndex;
    try {
      numberedIndex = Number.parseInt(index as string);
    } catch (err) {
      return;
    }
    if (numberedIndex < 0 || numberedIndex >= transcriptions.length) {
      return;
    }
    return transcriptions[numberedIndex];
  };

  const transcription = getTranscription();
  const [text, setText] = useState('');

  // Get the latest transcription text if it's finished transcribing
  useEffect(() => {
    const _getText = async () => {
      if (!transcription) return;
      if (transcription.status !== TranscriptionStatus.Finished) return;

      const response = await getText(
        transcription.modelLocation,
        transcription.audioName
      );
      if (response.ok) {
        const file = await response.blob();
        setText(await file.text());
      }
    };

    _getText();
  }, [transcription, transcription?.status]);

  if (!transcription) {
    return (
      <div className="container">
        <h1 className="title">Transcription Not Found</h1>
        <p>Could not find a transcription at the provided index</p>
      </div>
    );
  }

  return (
    <div className="container space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="title">Transcription</h1>
        <Link href={urls.transcriptions.index}>
          <a>
            <Button variant="secondary">Back</Button>
          </a>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Info</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 font-light text-base">
          <InfoSection name="Audio Name" icon={FileAudio2}>
            <p>{transcription.audioName}.wav</p>
          </InfoSection>
          <InfoSection name="Model Name" icon={FileBox}>
            <p>
              {transcription.isLocal ? (
                transcription.modelLocation
              ) : (
                <a
                  className="text-blue-500"
                  href={`https://huggingface.co/${transcription.modelLocation}`}
                >
                  {transcription.modelLocation}
                </a>
              )}
            </p>
          </InfoSection>
          <InfoSection name="Is Local" icon={Home}>
            <p>{transcription.isLocal ? 'True' : 'False'}</p>
          </InfoSection>
          <InfoSection name="Status" icon={Dot}>
            <p>{transcription.status}</p>
          </InfoSection>
        </CardContent>
      </Card>
      {transcription.status === TranscriptionStatus.Finished && (
        <Card>
          <CardHeader>
            <CardTitle>Transcript</CardTitle>
          </CardHeader>
          <CardContent>{text}</CardContent>
          <CardFooter className="flex space-x-2">
            <DownloadTranscriptionFileButton
              transcription={transcription}
              fileType="text"
              variant="secondary"
            >
              <Download className="h-4 w-4 mr-2" />
              <span>Download Text</span>
            </DownloadTranscriptionFileButton>
            <DownloadTranscriptionFileButton
              transcription={transcription}
              fileType="elan"
              variant="secondary"
            >
              <Download className="h-4 w-4 mr-2" />
              <span>Download Elan</span>
            </DownloadTranscriptionFileButton>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

type InfoSectionProps = {
  name: string;
  icon: Icon;
  children: React.ReactNode;
};

const InfoSection: FC<InfoSectionProps> = ({name, icon, children}) => {
  const SectionIcon = icon;

  return (
    <div className="flex items-center space-x-2">
      <SectionIcon className="h-8 w-8" strokeWidth={1} />
      <div>
        <Label>{name}</Label>
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
};
