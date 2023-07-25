import DatasetFiles from 'components/datasets/DatasetFiles';
import ChooseElanOptions from 'components/datasets/ChooseElanOptions';
import React, {useState} from 'react';
import ChooseCleaningOptions from 'components/datasets/ChooseCleaningOptions';
import {
  cleaningOptionsAtom,
  datasetNameAtom,
  elanOptionsAtom,
  filesAtom,
} from 'store';
import {useResetAtom} from 'jotai/utils';
import {useAtom} from 'jotai';
import ChooseDatasetName from 'components/datasets/ChooseDatasetName';
import {createDataset} from 'lib/api/datasets';
import {useRouter} from 'next/router';
import urls from 'lib/urls';
import {isValidForDataset} from 'lib/dataset';
import {Button} from 'components/ui/button';
import {Loader} from 'lucide-react';

const NewDatasetPage: React.FC = () => {
  const router = useRouter();

  const [error, setError] = useState('');
  const [files] = useAtom(filesAtom);
  const [cleaningOptions] = useAtom(cleaningOptionsAtom);
  const [elanOptions] = useAtom(elanOptionsAtom);
  const [name] = useAtom(datasetNameAtom);
  const [saving, setSaving] = useState(false);

  const resetFiles = useResetAtom(filesAtom);
  const resetElanOptions = useResetAtom(elanOptionsAtom);
  const resetCleaningOptions = useResetAtom(cleaningOptionsAtom);
  const resetName = useResetAtom(datasetNameAtom);

  const resetDataset = () => {
    resetFiles();
    resetElanOptions();
    resetCleaningOptions();
    resetName();
  };

  const canCreate = (): boolean => {
    return isValidForDataset(files.map(file => file.name));
  };

  const save = async () => {
    if (!canCreate() || saving) return;
    setSaving(true);

    const response = await createDataset(
      name,
      files,
      cleaningOptions,
      elanOptions
    );

    if (response.ok) {
      resetDataset();
      router.push(urls.datasets.index);
    } else {
      const data = await response.json();
      console.error(data);
      setError(data.error);
    }
    setSaving(false);
  };

  return (
    <div className="container py-8 space-y-4">
      <h1 className="text-3xl">New Dataset</h1>

      <ChooseDatasetName />
      <DatasetFiles />
      <ChooseElanOptions />
      <ChooseCleaningOptions />

      <div className="flex justify-end">
        <Button onClick={save} disabled={!canCreate() || saving}>
          {saving && <Loader className="mr-2 animate-spin" />}
          {saving ? 'Saving' : 'Save'}
        </Button>
      </div>
      {error && <p className="text-red-400">{error}</p>}
    </div>
  );
};

export default NewDatasetPage;
