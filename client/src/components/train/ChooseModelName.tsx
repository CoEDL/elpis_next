import {useAtom} from 'jotai';
import React, {useState} from 'react';
import {newModelAtom, newModelStageAtom} from 'store';
import {NewModelStage} from 'types/Model';

export default function ChooseModelName() {
  const [model, setModel] = useAtom(newModelAtom);
  const [, setStage] = useAtom(newModelStageAtom);
  const [name, setName] = useState('Model name');

  const save = () => {
    setModel({...model, modelName: name});
    setStage(NewModelStage.Dataset);
  };

  const hasName = name !== '';
  return (
    <div className="section">
      <h2 className="subtitle">Choose Model Name</h2>

      <div className="mt-4 space-x-2">
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="rounded"
        />
      </div>

      <div className="flex items-center justify-between mt-8">
        <button className="button" disabled>
          Back
        </button>
        <button className="button" disabled={!hasName} onClick={save}>
          Next
        </button>
      </div>
    </div>
  );
}
