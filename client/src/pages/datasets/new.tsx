import DatasetFiles from 'components/datasets/DatasetFiles';
import ChooseElanOptions from 'components/datasets/ChooseElanOptions';
import React, {useState} from 'react';
import ChooseCleaningOptions from 'components/datasets/ChooseCleaningOptions';
import {
  cleaningOptionsAtom,
  datasetNameAtom,
  datasetsAtom,
  elanOptionsAtom,
  filesAtom,
} from 'store';
import {useAtom} from 'jotai';
import ChooseDatasetName from 'components/datasets/ChooseDatasetName';
import {createDataset} from 'lib/api/datasets';
import {useRouter} from 'next/router';
import urls from 'lib/urls';

const NewDatasetPage: React.FC = () => {
  const router = useRouter();

  const [files] = useAtom(filesAtom);
  const [cleaningOptions] = useAtom(cleaningOptionsAtom);
  const [elanOptions] = useAtom(elanOptionsAtom);
  const [name] = useAtom(datasetNameAtom);
  const [datasets, setDatasets] = useAtom(datasetsAtom);

  const isValid = (): boolean => {
    if (files.length === 0) return false;
    if (files.length % 2 !== 0) return false;
    if (name === '') return false;
    if (datasets.some(dataset => dataset.name === name)) return false;

    return true;
  };

  const save = async () => {
    if (!isValid()) return;

    await createDataset(name, files, cleaningOptions, elanOptions);
    router.push(urls.datasets.index);
  };

  return (
    <div className="container py-8 space-y-4">
      <h1 className="text-3xl">New Dataset</h1>
      <DatasetFiles />
      <ChooseElanOptions />
      <ChooseCleaningOptions />
      <ChooseDatasetName />
      <div className="flex justify-end">
        <button className="button" onClick={save} disabled={!isValid()}>
          Save
        </button>
      </div>
    </div>
  );
};

export default NewDatasetPage;
