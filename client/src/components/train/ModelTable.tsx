import {useAtom} from 'jotai';
import fileDownload from 'js-file-download';
import {deleteModel, downloadModel, trainModel} from 'lib/api/models';
import urls from 'lib/urls';
import Link from 'next/link';
import React from 'react';
import {XCircle, Eye, Target, Download, Check} from 'react-feather';
import {modelsAtom} from 'store';
import {TrainingStatus} from 'types/Model';

const ModelTable: React.FC = () => {
  const [models, setModels] = useAtom(modelsAtom);

  const _deleteModel = async (name: string) => {
    const response = await deleteModel(name);
    if (response.ok) {
      setModels(models.filter(model => model.modelName !== name));
    } else {
      const error = await response.json();
      console.log(error);
      alert(error);
    }
  };

  const setModelStatus = (index: number, status: TrainingStatus) => {
    const nextModel = {...models[index], status};
    setModels([
      ...models.slice(0, index),
      nextModel,
      ...models.slice(index + 1),
    ]);
  };

  const download = async (modelName: string) => {
    const response = await downloadModel(modelName);
    if (response.ok) {
      const blob = await response.blob();
      fileDownload(blob, modelName + '.zip');
    } else {
      console.error("Couldn't download model :(");
    }
  };

  const _trainModel = async (index: number) => {
    setModelStatus(index, TrainingStatus.Training);
    const response = await trainModel(models[index].modelName);
    if (response.ok) {
      setModelStatus(index, TrainingStatus.Finished);
    } else {
      setModelStatus(index, TrainingStatus.Error);
      const error = await response.json();
      console.log(error);
      alert(error);
    }
  };

  if (models.length === 0) {
    return <p>No current models!</p>;
  }

  return (
    <div className="text-left w-full">
      <table className="w-full table">
        <thead>
          <tr>
            <th>Model Name</th>
            <th>Dataset Name</th>
            <th>Base Model</th>
            <th>Status</th>
            <th>Train</th>
            <th>Download</th>
            <th>View</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {models.map((model, index) => (
            <tr key={index}>
              <td>{model.modelName}</td>
              <td>{model.datasetName}</td>
              <td className="text-blue-500 hover:underline">
                <a href={'https://huggingface.co/' + model.baseModel}>
                  {model.baseModel ?? 'unknown'}
                </a>
              </td>
              <td>{model.status}</td>
              <td>
                {model.status !== TrainingStatus.Training &&
                model.status !== TrainingStatus.Finished ? (
                  <button onClick={() => _trainModel(index)}>
                    <Target color="green" />
                  </button>
                ) : (
                  <Check />
                )}
              </td>
              <td>
                <button
                  onClick={() => download(model.modelName)}
                  disabled={model.status !== TrainingStatus.Finished}
                >
                  <Download />
                </button>
              </td>
              <td>
                <Link href={urls.train.view + '/' + model.modelName}>
                  <a>
                    <Eye color="blue" />
                  </a>
                </Link>
              </td>
              <td>
                <button onClick={() => _deleteModel(model.modelName)}>
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

export default ModelTable;
