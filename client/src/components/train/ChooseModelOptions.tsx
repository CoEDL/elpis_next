import {useAtom} from 'jotai';
import {createModel} from 'lib/api/models';
import urls from 'lib/urls';
import {useRouter} from 'next/router';
import React from 'react';
import {newModelAtom, newModelStageAtom} from 'store';
import {useResetAtom} from 'jotai/utils';
import {BASE_MODEL, NewModelStage} from 'types/Model';

export default function ChooseModelOptions() {
  const router = useRouter();

  const [model, setModel] = useAtom(newModelAtom);
  const [, setStage] = useAtom(newModelStageAtom);

  const resetModel = useResetAtom(newModelAtom);
  const resetStage = useResetAtom(newModelStageAtom);

  const options = {
    baseModel: model?.baseModel ?? BASE_MODEL,
    samplingRate: model?.samplingRate ?? 16_000,
  };

  const isValid = () => {
    return model?.datasetName && model?.options;
  };

  const save = async () => {
    const response = await createModel(model!);
    if (response.ok) {
      resetModel();
      resetStage();
      router.push(urls.train.index);
    } else {
      const data = await response.json();
      console.error(data);
    }
  };

  if (!model) return <></>;

  return (
    <div className="section">
      <h2 className="text-xl">Choose Model Options</h2>

      <div className="grid grid-cols-2 gap-2 mt-8 items-center">
        <label htmlFor="baseModel">Base Model:</label>
        <input
          id="baseModel"
          type="text"
          onChange={e => setModel({...model!, baseModel: e.target.value})}
          value={options.baseModel}
        />

        <label htmlFor="samplingRate">Audio Sampling Rate:</label>
        <input
          id="samplingRate"
          type="number"
          onChange={e =>
            setModel({...model!, samplingRate: Number.parseInt(e.target.value)})
          }
          value={options.samplingRate}
        />
      </div>

      <div className="flex items-center justify-between mt-8">
        <button
          className="button"
          onClick={() => {
            setStage(NewModelStage.TrainingOptions);
          }}
        >
          Back
        </button>
        <button className="button" disabled={!isValid()} onClick={save}>
          Save
        </button>
      </div>
    </div>
  );
}
