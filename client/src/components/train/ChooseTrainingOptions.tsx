import {useAtom} from 'jotai';
import React from 'react';
import {newModelAtom, newModelStageAtom} from 'store';
import {NewModelStage, TrainingOptions} from 'types/Model';

const DEFAULT_TRAINING_OPTIONS: TrainingOptions = {
  batchSize: 4,
  epochs: 2,
  learningRate: 1e-4,
  minDuration: 0,
  maxDuration: 60,
  wordDelimiterToken: ' ',
  testSize: 0.2,
  freezeFeatureExtractor: true,
};

export default function ChooseTrainingOptions() {
  const [model, setModel] = useAtom(newModelAtom);
  const [, setStage] = useAtom(newModelStageAtom);

  const options = {
    ...DEFAULT_TRAINING_OPTIONS,
    ...(model?.options ?? DEFAULT_TRAINING_OPTIONS),
  };

  const updateOption =
    (option: keyof TrainingOptions, isNumber = false) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = isNumber
        ? Number.parseInt(e.target.value)
        : e.target.value;
      const newOptions = {...options, [option]: newValue};
      setModel({...model!, options: newOptions});
    };

  const toggleFeatureExtractor = () => {
    const newOptions = {
      ...options,
      freezeFeatureExtractor: !options.freezeFeatureExtractor,
    };
    setModel({...model!, options: newOptions});
  };

  if (!model) return <></>;

  const numberOption = (
    name: string,
    option: keyof TrainingOptions,
    step = 1
  ) => (
    <>
      <label htmlFor={option}>{name}:</label>
      <input
        type="number"
        onChange={updateOption(option, true)}
        min={0}
        step={step}
        value={options[option] as number}
      />
    </>
  );

  return (
    <div className="section">
      <h2 className="text-xl">Choose Training Options</h2>

      <div className="grid grid-cols-2 gap-2 mt-8 items-center">
        {numberOption('Batch Size', 'batchSize')}
        {numberOption('Epochs', 'epochs')}
        {numberOption('Learning Rate', 'learningRate', 0.0001)}
        {numberOption('Min epoch duration', 'minDuration')}
        {numberOption('Max epoch duration', 'maxDuration')}

        <label htmlFor="wordDelimiterToken">
          Word Delimiter Token (default &quot; &quot;):
        </label>
        <input
          type="text"
          onChange={updateOption('wordDelimiterToken')}
          value={options.wordDelimiterToken as string}
        />

        {numberOption('Test-set percentage', 'testSize')}
        <label htmlFor="freezeFeatureExtractor">
          Freeze Feature Extractor:
        </label>
        <input
          type="checkbox"
          onChange={toggleFeatureExtractor}
          checked={options?.freezeFeatureExtractor ?? true}
        />
      </div>

      <div className="flex items-center justify-between mt-8">
        <button
          className="button"
          onClick={() => {
            setStage(NewModelStage.Dataset);
          }}
        >
          Back
        </button>
        <button
          className="button"
          disabled={model?.options === undefined}
          onClick={() => {
            setStage(NewModelStage.ModelOptions);
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
