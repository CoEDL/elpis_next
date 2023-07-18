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
import {Tabs, TabsContent, TabsList, TabsTrigger} from 'components/ui/tabs';
import ClientOnly from 'components/ClientOnly';

type ModelType = 'local' | 'huggingface';

export default function TranscribePage() {
  const router = useRouter();
  const [files, setFiles] = useAtom(transcriptionFilesAtom);
  const [modelLocation, setModelLocation] = useAtom(modelLocationAtom);
  const [models] = useAtom(modelsAtom);
  const [error, setError] = useState('');
  const [type, setType] = useState<ModelType>('local');

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
    (type === 'huggingface' ||
      models.map(model => model.modelName).includes(modelLocation));

  return (
    <div className="container flex flex-col space-y-4">
      <div>
        <h1 className="title">New Transcriptions</h1>
      </div>

      <ClientOnly>
        <Tabs
          className="w-full"
          value={type}
          onValueChange={x => setType(x as ModelType)}
        >
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="local">Local Model</TabsTrigger>
            <TabsTrigger value="huggingface">Huggingface Model</TabsTrigger>
          </TabsList>

          <TabsContent value="local">
            <ChooseModel />
          </TabsContent>
          <TabsContent value="huggingface">
            <ChooseHuggingFaceModel />
          </TabsContent>
        </Tabs>
      </ClientOnly>

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
