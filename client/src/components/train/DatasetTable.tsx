import {useAtom} from 'jotai';
import fileDownload from 'js-file-download';
import {deleteDataset, downloadDataset} from 'lib/api/datasets';
import React from 'react';
import {Download, Trash2} from 'lucide-react';
import {datasetsAtom} from 'store';
import DataTable, {Section} from 'components/DataTable';
import Dataset from 'types/Dataset';
import {Button} from 'components/ui/button';
import ConfirmDelete from 'components/ConfirmDelete';
import colours from 'lib/colours';

const DatasetTable: React.FC = () => {
  const [datasets, setDatasets] = useAtom(datasetsAtom);

  const _deleteDataset = async (name: string) => {
    const response = await deleteDataset(name);
    if (response.ok) {
      setDatasets(datasets.filter(dataset => dataset.name !== name));
    } else {
      const error = await response.json();
      alert(error);
    }
  };

  const _downloadDataset = async (datasetName: string) => {
    const response = await downloadDataset(datasetName);
    if (response.ok) {
      const blob = await response.blob();
      fileDownload(blob, datasetName + '.zip');
    } else {
      console.error("Couldn't download dataset :(");
    }
  };

  const sections: Section<Dataset>[] = [
    {
      name: 'Name',
      display: dataset => <span className="font-semibold">{dataset.name}</span>,
    },
    {name: 'Source', display: () => 'Local'},
    {name: 'File Count', display: dataset => dataset.files.length},
    {
      name: 'Download',
      display: dataset => (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => _downloadDataset(dataset.name)}
        >
          <Download />
        </Button>
      ),
    },
    {
      name: 'Delete',
      display: dataset => (
        <ConfirmDelete
          title={`Delete ${dataset.name}?`}
          description="Once deleted, the local dataset cannot be recovered."
          action={() => _deleteDataset(dataset.name)}
        >
          <button title="Delete this dataset">
            <Trash2 color={colours.delete} />
          </button>
        </ConfirmDelete>
      ),
    },
  ];

  if (datasets.length === 0) {
    return <p>No current datasets!</p>;
  }

  return <DataTable data={datasets} sections={sections} />;
};

export default DatasetTable;
