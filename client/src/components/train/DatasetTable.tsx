import {useAtom} from 'jotai';
import fileDownload from 'js-file-download';
import {deleteDataset, downloadDataset} from 'lib/api/datasets';
import colours from 'lib/colours';
import React from 'react';
import {Download, Trash2} from 'react-feather';
import {datasetsAtom} from 'store';

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

  if (datasets.length === 0) {
    return <p>No current datasets!</p>;
  }

  return (
    <div className="text-left w-full">
      <table className="w-full table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Source</th>
            <th>Number of Files</th>
            <th>Download</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {datasets.map((dataset, index) => (
            <tr key={index}>
              <td>{dataset.name}</td>
              <td>Local</td>
              <td>{dataset.files.length}</td>
              <td>
                <button onClick={() => _downloadDataset(dataset.name)}>
                  <Download color={colours.grey} />
                </button>
              </td>
              <td>
                <button onClick={() => _deleteDataset(dataset.name)}>
                  <Trash2 color={colours.delete} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DatasetTable;
