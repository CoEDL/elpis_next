import {useAtom} from 'jotai';
import React from 'react';
import {datasetNameAtom} from 'store';

export default function ChooseDatasetName() {
  const [name, setName] = useAtom(datasetNameAtom);

  return (
    <div className="p-4 border">
      <h2 className="text-xl">Choose Dataset Name</h2>

      <div className="mt-4 space-x-2">
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="rounded"
        />
      </div>
    </div>
  );
}
