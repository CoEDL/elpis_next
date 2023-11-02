import React from 'react';
import Model, {TrainingStatus} from 'types/Model';
import ViewTrainingOptions from './ViewTrainingOptions';

type Props = {
  model: Model;
};

const ViewModelInfo: React.FC<Props> = ({model}) => {
  return (
    <>
      <h2 className="text-xl">Model Information</h2>
      <div className="grid grid-cols-2 text-sm">
        <p className="info">Model Name:</p>
        <p>{model.name}</p>

        <p className="info">Dataset Name:</p>
        <p>
          {(model.dataArgs.datasetNameOrPath.length ?? 0) > 0
            ? model.dataArgs.datasetNameOrPath
            : 'N/A Uploaded From Zip'}
        </p>

        <p className="info">Base Model:</p>
        <p>{model.modelArgs.modelNameOrPath ?? 'N/A Uploaded from Zip'}</p>

        <p className="info">Model Status:</p>
        <p>{model.status ?? TrainingStatus.Error}</p>
      </div>
      <ViewTrainingOptions model={model} />
    </>
  );
};

export default ViewModelInfo;
