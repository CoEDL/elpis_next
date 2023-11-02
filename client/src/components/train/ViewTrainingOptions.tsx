import React from 'react';
import {Model} from 'types/Model';

type Props = {
  model: Model;
};

const ViewTrainingOptions: React.FC<Props> = ({model}) => {
  return (
    <div>
      <p className="text-xl mb-2">Training Options</p>
      <div className="text-sm grid grid-cols-2">
        <p className="info">Epochs:</p>
        <p>{model.trainingArgs.numTrainEpochs}</p>

        <p className="info">Training Batch Size:</p>
        <p>{model.trainingArgs.perDeviceTrainBatchSize}</p>

        <p className="info">Eval Batch Size:</p>
        <p>{model.trainingArgs.perDeviceEvalBatchSize}</p>

        <p className="info">Learning Rate:</p>
        <p>{model.trainingArgs.learningRate}</p>
      </div>
    </div>
  );
};

export default ViewTrainingOptions;
