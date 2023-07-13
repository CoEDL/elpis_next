import {Button} from 'components/ui/button';
import {useAtom} from 'jotai';
import urls from 'lib/urls';
import Link from 'next/link';
import React from 'react';
import {datasetsAtom, newModelAtom, newModelStageAtom} from 'store';
import Dataset from 'types/Dataset';
import {NewModelStage} from 'types/Model';

export default function ChooseDataset() {
  const [model, setModel] = useAtom(newModelAtom);
  const [datasets] = useAtom(datasetsAtom);
  const [, setStage] = useAtom(newModelStageAtom);

  const save = () => {
    setStage(NewModelStage.TrainingOptions);
  };

  const hasDataset = model?.datasetName !== undefined;

  if (datasets.length === 0) {
    return (
      <div className="section space-y-2">
        <h2 className="subtitle">Choose Dataset</h2>
        <p>
          No datasets available! A local dataset is needed before creating a
          model.
        </p>

        <Link href={urls.datasets.new}>
          <button className="button">Create Dataset</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="section">
      <h2 className="subtitle">Choose Dataset</h2>

      <div className="mt-4 space-x-2 flex">
        {datasets.map(dataset => (
          <DatasetSelector
            dataset={dataset}
            key={dataset.name}
            isSelected={dataset.name === model?.datasetName}
            onClick={() => {
              setModel({...model!, datasetName: dataset.name});
            }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between mt-8">
        <Button
          variant="secondary"
          onClick={() => setStage(NewModelStage.Name)}
        >
          Back
        </Button>
        <Button disabled={!hasDataset} onClick={save}>
          Next
        </Button>
      </div>
    </div>
  );
}

type SelectorProps = {
  dataset: Dataset;
  isSelected: boolean;
  onClick(): void;
};

const DatasetSelector: React.FC<SelectorProps> = ({
  dataset,
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
      {dataset.name}
    </div>
  );
};
