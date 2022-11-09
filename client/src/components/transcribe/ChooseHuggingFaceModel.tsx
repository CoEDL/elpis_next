import {useAtom} from 'jotai';
import React from 'react';
import {modelLocationAtom} from 'store';
import {BASE_MODEL} from 'types/Model';

export default function ChooseHuggingFaceModel() {
  const [modelLocation, setModelLocation] = useAtom(modelLocationAtom);

  return (
    <div className="">
      <h2 className="text-lg font-light">HuggingFace Model Name</h2>
      <p className="mt-2 text-sm text-gray-700">Description</p>

      <div className="mt-4 text-sm flex items-center space-x-4">
        <label htmlFor="hfLocation" className="font-semibold">
          Model Name:
        </label>
        <input
          id="hfLocation"
          className="flex-1"
          type="text"
          value={modelLocation}
          onChange={e => setModelLocation(e.target.value)}
        />
        <button className="button" onClick={() => setModelLocation(BASE_MODEL)}>
          Default
        </button>
      </div>
    </div>
  );
}
