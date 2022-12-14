import {useAtom} from 'jotai';
import urls from 'lib/urls';
import Link from 'next/link';
import React from 'react';
import {modelLocationAtom, modelsAtom} from 'store';
import {TrainingStatus} from 'types/Model';

export default function ChooseModel() {
  const [models] = useAtom(modelsAtom);
  const [modelLocation, setModelLocation] = useAtom(modelLocationAtom);

  if (!models.some(model => model.status === TrainingStatus.Finished)) {
    return (
      <div className="space-y-2">
        <h2 className="text-lg font-light">Choose Trained Model</h2>
        <p>
          No trained models available! Before performing inference on an audio
          file, you must create and train a model.
        </p>

        <Link href={urls.train.index}>
          <button className="button">Models Home</button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-light">Select Trained Model</h2>
      <p className="mt-2 text-sm text-gray-700 italic">
        This only displays models which have finished training.
      </p>
      <div className="mt-4 flex space-x-4">
        {models
          .filter(model => model.status === TrainingStatus.Finished)
          .map(model => (
            <ModelSelector
              key={model.modelName}
              modelName={model.modelName}
              isSelected={modelLocation === model.modelName}
              onClick={() => setModelLocation(model.modelName)}
            />
          ))}
      </div>
    </div>
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
