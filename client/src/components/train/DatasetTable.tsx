import {useAtom} from 'jotai';
import {deleteDataset} from 'lib/api/datasets';
import React from 'react';
import {XCircle} from 'react-feather';
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

  if (datasets.length === 0) {
    return <p>No current datasets!</p>;
  }

  return (
    <div className="p-4 border text-left w-full">
      <table className="w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Source</th>
            <th>Number of Files</th>
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
                <button
                  className="px-2 py-1"
                  onClick={() => _deleteDataset(dataset.name)}
                >
                  <XCircle color="red" />
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
