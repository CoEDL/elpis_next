import React, {useEffect} from 'react';
import {transcriptionsAtom} from 'store';
import {useAtom} from 'jotai';
import {getTranscriptions} from 'lib/api/transcribe';
import TranscriptionsTable from 'components/transcribe/TranscriptionsTable';
import Link from 'next/link';
import urls from 'lib/urls';
import Transcription from 'types/Transcription';
import ClientOnly from 'components/ClientOnly';
import {Button} from 'components/ui/button';
import {Plus} from 'lucide-react';

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
      <div className="mt-4">
        <Link href={urls.transcriptions.new}>
          <a>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Button>
          </a>
        </Link>
      </div>

      <ClientOnly className="mt-8 space-y-4">
        <h2 className="subtitle">Your Transcriptions</h2>
        <TranscriptionsTable />
      </ClientOnly>
    </div>
  );
}
