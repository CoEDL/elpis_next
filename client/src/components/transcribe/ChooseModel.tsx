import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'components/ui/select';
import {useAtom, useSetAtom} from 'jotai';
import urls from 'lib/urls';
import Link from 'next/link';
import React from 'react';
import {modelLocationAtom, modelsAtom} from 'store';
import {TrainingStatus} from 'types/Model';

export default function ChooseModel() {
  const [models] = useAtom(modelsAtom);
  const setModelLocation = useSetAtom(modelLocationAtom);

  if (!models.some(model => model.status === TrainingStatus.Finished)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Trained Model</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-lg font-light">Choose Trained Model</h2>
          <p>
            No trained models available! Before performing inference on an audio
            file, you must create and train a model.
          </p>

          <Link href={urls.train.index}>
            <button className="button">Models Home</button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Trained Model</CardTitle>
        <CardDescription>
          This only displays the local models which have finished training.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select onValueChange={setModelLocation}>
          <SelectTrigger>
            <SelectValue placeholder="Select a trained model." />
          </SelectTrigger>
          <SelectContent>
            {models
              .filter(model => model.status === TrainingStatus.Finished)
              .map(model => (
                <SelectItem key={model.modelName} value={model.modelName}>
                  {model.modelName}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}

type SelectorProps = {
  modelName: string;
  isSelected: boolean;
  onClick(): void;
};

const ModelSelector: React.FC<SelectorProps> = ({
  modelName,
  isSelected,
  onClick,
}) => {
  const defaultStyle = `py-2 px-4 font-semibold text-sm cursor-pointer
        hover:bg-purple-200 shadow hover:shadow-none `;
  return (
    <div
      onClick={onClick}
      className={defaultStyle + (isSelected && 'bg-purple-200')}
    >
      {modelName}
    </div>
  );
};
