import {useAtom} from 'jotai';
import React, {useState} from 'react';
import {
  modelIsLocalAtom,
  modelLocationAtom,
  modelsAtom,
  transcriptionFilesAtom,
} from 'store';
import {createTranscriptionJobs} from 'lib/api/transcribe';
import ChooseModel from 'components/transcribe/ChooseModel';
import ChooseHuggingFaceModel from 'components/transcribe/ChooseHuggingFaceModel';
import TranscriptionFileUpload from 'components/transcribe/TranscriptionFileUpload';
import {useRouter} from 'next/router';
import urls from 'lib/urls';
import {FileType, parseFileType} from 'lib/dataset';
import {Button} from 'components/ui/button';

export default function TranscribePage() {
  const router = useRouter();
  const [files, setFiles] = useAtom(transcriptionFilesAtom);
  const [modelLocation, setModelLocation] = useAtom(modelLocationAtom);
  const [models] = useAtom(modelsAtom);
  const [isLocal, setIsLocal] = useAtom(modelIsLocalAtom);
  const [error, setError] = useState('');

  const _createTranscriptions = async () => {
    const response = await createTranscriptionJobs(files, modelLocation);
    if (response.ok) {
      setModelLocation('');
      setFiles([]);
      router.push(urls.transcriptions.index);
    } else {
      const text = await response.text();
      setError(text);
      console.error(text);
    }
  };

  const canAddTranscriptions =
    files.length > 0 &&
    files.every(file => parseFileType(file.name) === FileType.Audio) &&
    modelLocation.length > 0 &&
    (!isLocal || models.map(model => model.modelName).includes(modelLocation));

  return (
    <div className="container flex flex-col space-y-4">
      <div>
        <h1 className="title">New Transcriptions</h1>
        <p className="page-description mt-2">blah</p>
      </div>

      <div className="section space-y-4">
        <h2 className="subtitle">1. Choose model location</h2>
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
        {isLocal ? <ChooseModel /> : <ChooseHuggingFaceModel />}
      </div>

      <TranscriptionFileUpload />

      <div className="flex justify-end">
        <Button
          onClick={_createTranscriptions}
          disabled={!canAddTranscriptions}
        >
          Transcribe
        </Button>
      </div>

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
