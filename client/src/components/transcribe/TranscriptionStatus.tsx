import PromiseLoader from 'components/PromiseLoader';
import {getTranscriptionStatus} from 'lib/api/transcribe';
import React from 'react';

type StatusProps = {
  modelLocation: string;
  audioName: string;
};

export default function TranscriptionStatus({
  modelLocation,
  audioName,
}: StatusProps) {
  return (
    <PromiseLoader
      promise={getTranscriptionStatus(modelLocation, audioName)}
      onResolve={response => {
        if (response.ok) {
          return (
            <PromiseLoader
              promise={response.json()}
              onResolve={status => <p>{status}</p>}
            ></PromiseLoader>
          );
        } else {
          return <p>Error</p>;
        }
      }}
    ></PromiseLoader>
  );
}
