import React, {useEffect} from 'react';
import {transcriptionsAtom} from 'store';
import {useAtom} from 'jotai';
import {getTranscriptions} from 'lib/api/transcribe';
import TranscriptionsTable from 'components/transcribe/TranscriptionsTable';
import Link from 'next/link';
import urls from 'lib/urls';
import Transcription from 'types/Transcription';

export default function TranscriptionsPage() {
  const [, setTranscriptions] = useAtom(transcriptionsAtom);

  useEffect(() => {
    const fetchTranscriptions = async () => {
      const response = await getTranscriptions();
      if (response.ok) {
        const transcriptions: Transcription[] = await response.json();
        setTranscriptions(transcriptions);
      } else {
        console.error("Couldn't download transcriptions!");
      }
    };
    fetchTranscriptions();
  }, [setTranscriptions]);

  return (
    <div className="container">
      <h1 className="title">Transcriptions</h1>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Your Transcriptions</h2>
        <TranscriptionsTable />
      </div>
      <div className="mt-4">
        <Link href={urls.transcriptions.new}>
          <a>
            <button className="button">Create New</button>
          </a>
        </Link>
      </div>
    </div>
  );
}
