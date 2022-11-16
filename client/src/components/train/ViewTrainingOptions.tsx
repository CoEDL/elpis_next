import React from 'react';
import {TrainingOptions} from 'types/Model';

type Props = {
  options: TrainingOptions;
};

const ViewTrainingOptions: React.FC<Props> = ({options}) => {
  return (
    <div>
      <p className="text-xl mb-2">Training Options</p>
      <div className="text-sm grid grid-cols-2">
        <p className="info">Epochs:</p>
        <p>{options.epochs}</p>

        <p className="info">Batch Size:</p>
        <p>{options.batchSize}</p>

        <p className="info">Learning Rate:</p>
        <p>{options.learningRate}</p>

        <p className="info">Min Duration:</p>
        <p>{options.minDuration}</p>

        <p className="info">Max Duration:</p>
        <p>{options.maxDuration}</p>

        <p className="info">Test set Size:</p>
        <p>{options.testSize}</p>

        <p className="info">Word Delimiter Token:</p>
        <p>&quot;{options.wordDelimiterToken}&quot;</p>

        <p className="info">Freeze Feature Extractor:</p>
        <p>{options.freezeFeatureExtractor ? 'True' : 'False'}</p>
      </div>
    </div>
  );
};

export default ViewTrainingOptions;
