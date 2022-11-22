import DownloadTranscriptionFileButton from 'components/transcribe/DownloadTranscriptionFileButton';
import {useAtom} from 'jotai';
import {getText} from 'lib/api/transcribe';
import urls from 'lib/urls';
import Link from 'next/link';
import {useRouter} from 'next/router';
import React, {useEffect, useState} from 'react';
import {Download} from 'react-feather';
import {transcriptionsAtom} from 'store';
import Transcription, {TranscriptionStatus} from 'types/Transcription';

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
        <h1 className="title">View Transcription</h1>
        <Link href={urls.transcriptions.index}>
          <a>
            <button className="button">Back</button>
          </a>
        </Link>
      </div>
      <div className="grid grid-cols-2 section">
        <p className="font-semibold">Model Name:</p>
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

        <p className="font-semibold">Audio Name:</p>
        <p>{transcription.audioName}.wav</p>
        <p className="font-semibold">Is Local:</p>
        <p>{transcription.isLocal ? 'True' : 'False'}</p>
        <p className="font-semibold">Status:</p>
        <p>{transcription.status}</p>
      </div>
      {transcription.status === TranscriptionStatus.Finished && (
        <>
          <div className="section">
            <h2 className="font-semibold mb-2">Transcript:</h2>
            <p className="text-gray-700">{text}</p>
          </div>
          <div className="flex space-x-2">
            <DownloadTranscriptionFileButton
              transcription={transcription}
              fileType="text"
              className="button"
            >
              Download Text
            </DownloadTranscriptionFileButton>
            <DownloadTranscriptionFileButton
              transcription={transcription}
              fileType="elan"
              className="button"
            >
              Download Elan
            </DownloadTranscriptionFileButton>
          </div>
        </>
      )}
    </div>
  );
}
