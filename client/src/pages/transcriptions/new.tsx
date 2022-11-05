import {useAtom} from 'jotai';
import React, {useState} from 'react';
import {
  modelIsLocalAtom,
  modelLocationAtom,
  transcriptionFilesAtom,
} from 'store';
import {createTranscriptionJobs} from 'lib/api/transcribe';
import ChooseModel from 'components/transcribe/ChooseModel';
import ChooseHuggingFaceModel from 'components/transcribe/ChooseHuggingFaceModel';
import TranscriptionFileUpload from 'components/transcribe/TranscriptionFileUpload';

export default function TranscribePage() {
  const [files, setFiles] = useAtom(transcriptionFilesAtom);
  const [modelLocation] = useAtom(modelLocationAtom);
  const [isLocal, setIsLocal] = useAtom(modelIsLocalAtom);
  const [error, setError] = useState('');

  const _transcribe = async () => {
    const response = await createTranscriptionJobs(files, modelLocation);
    if (response.ok) {
      console.log('success!');
    } else {
      const text = await response.text();
      setError(text);
      console.error(text);
    }
  };

  return (
    <div className="container flex flex-col space-y-4">
      <div>
        <h1 className="title">New Transcriptions</h1>
        <p className="">blah</p>
      </div>

      <div className="section">
        <h2 className="text-xl">Choose model location</h2>
        <div className="mt-4 flex space-x-2 items-center">
          <input
            type={'checkbox'}
            id="isLocal"
            checked={isLocal}
            onChange={() => setIsLocal(!isLocal)}
          />
          <label htmlFor="isLocal" className="text-sm">
            Use Local Model?
          </label>
        </div>
      </div>
      {isLocal ? <ChooseModel /> : <ChooseHuggingFaceModel />}
      <TranscriptionFileUpload />
      <div className="flex justify-end">
        <button className="button" onClick={_transcribe}>
          Transcribe
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
