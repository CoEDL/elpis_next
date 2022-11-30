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

  const isValid = () => {
    if (
      Object.keys(options).some(
        key => options[key as keyof TrainingOptions] === undefined
      )
    ) {
      return false;
    }
    return (
      options.batchSize! > 0 &&
      options.epochs! > 0 &&
      options.learningRate! > 0 &&
      options.minDuration! >= 0 &&
      options.maxDuration! >= options.minDuration! &&
      options.testSize! > 0 &&
      options.testSize! < 1 &&
      options.wordDelimiterToken!.length > 0
    );
  };

  const updateOption =
    (option: keyof TrainingOptions, isNumber = false) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue: string | number = e.target.value;

      if (isNumber) {
        if (newValue.length > 0) {
          newValue = Number.parseFloat(newValue);
        } else {
          newValue = 0;
        }
      }

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

  const numberOptionData: NumberOptionProps[] = [
    {name: 'Batch Size', option: 'batchSize'},
    {name: 'Epochs', option: 'epochs'},
    {name: 'Learning Rate', option: 'learningRate', step: 0.0001},
    {name: 'Min epoch duration', option: 'minDuration'},
    {name: 'Max epoch duration', option: 'maxDuration'},
    {name: 'Test-set percentage', option: 'testSize', step: 0.01},
  ]
    .map(base => ({...base, option: base.option as keyof TrainingOptions}))
    .map(base => ({
      ...base,
      options,
      onChange: updateOption(base.option as keyof TrainingOptions, true),
    }));

  return (
    <div className="section">
      <h2 className="subtitle">Choose Training Options</h2>

      <div className="grid grid-cols-2 gap-2 mt-4 items-center">
        {numberOptionData.map(data => (
          <NumberOption key={data.name} {...data} />
        ))}

        <label htmlFor="wordDelimiterToken">
          Word Delimiter Token (default &quot; &quot;):
        </label>
        <input
          type="text"
          onChange={updateOption('wordDelimiterToken')}
          value={options.wordDelimiterToken as string}
        />

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
          disabled={!isValid()}
          onClick={() => {
            setModel({...model!, options});
            setStage(NewModelStage.ModelOptions);
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

type NumberOptionProps = {
  name: string;
  option: keyof TrainingOptions;
  options: TrainingOptions;
  onChange(e: React.ChangeEvent<HTMLInputElement>): void;
  step?: number;
};

const NumberOption: React.FC<NumberOptionProps> = ({
  name,
  option,
  options,
  onChange,
  step = 1,
}) => {
  return (
    <>
      <label htmlFor={option}>{name}:</label>
      <input
        type="number"
        onChange={onChange}
        min={0}
        step={step}
        value={options[option] as number}
      />
    </>
  );
};
