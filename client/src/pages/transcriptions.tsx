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
      <p className="mt-2 text-gray-800">Blah blah blah</p>

      <div className="mt-8 space-y-4">
        <h2 className="subtitle">Your Transcriptions</h2>
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
