import {Button} from 'components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'components/ui/card';
import {Input} from 'components/ui/input';
import {Label} from 'components/ui/label';
import {useAtom} from 'jotai';
import {RotateCcw} from 'lucide-react';
import React from 'react';
import {modelLocationAtom} from 'store';
import {BASE_MODEL} from 'types/Model';

export default function ChooseHuggingFaceModel() {
  const [modelLocation, setModelLocation] = useAtom(modelLocationAtom);

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Choose HuggingFace Model</CardTitle>
        <CardDescription>
          Use a pretrained model from HuggingFace. Available models can be found{' '}
          <a
            href="https://huggingface.co/models?pipeline_tag=automatic-speech-recognition"
            target="_blank"
            rel="noreferrer"
            className="underline text-blue-500"
          >
            here.
          </a>
        </CardDescription>
        <CardDescription>
          Model names must be of the form:{' '}
          <code>&quot;&#123;researchers&#125;/&#123;modelName&#125;&quot;</code>
          , e.g.
          <code>facebook/wav2vec2-base-960h</code>.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Label htmlFor="hfLocation" className="font-semibold">
          🤗 Model Name
        </Label>
        <div className="flex space-x-2 items-center">
          <Input
            id="hfLocation"
            className="flex-1"
            type="text"
            value={modelLocation}
            onChange={e => setModelLocation(e.target.value)}
          />
          <Button
            variant="secondary"
            onClick={() => setModelLocation(BASE_MODEL)}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
