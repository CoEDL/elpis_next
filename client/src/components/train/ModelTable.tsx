import {useAtom} from 'jotai';
import fileDownload from 'js-file-download';
import {deleteModel, downloadModel, trainModel} from 'lib/api/models';
import colours from 'lib/colours';
import urls from 'lib/urls';
import Link from 'next/link';
import React from 'react';
import {
  Trash2,
  Eye,
  Download,
  Check,
  AlertTriangle,
  Loader,
  Play,
} from 'react-feather';
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
                <button
                  onClick={() => _trainModel(index)}
                  disabled={
                    model.status === TrainingStatus.Training ||
                    model.status === TrainingStatus.Finished
                  }
                >
                  <ModelStatusIndicator
                    status={model.status ?? TrainingStatus.Waiting}
                  />
                </button>
              </td>
              <td>
                <button
                  onClick={() => download(model.modelName)}
                  disabled={model.status !== TrainingStatus.Finished}
                >
                  <Download
                    color={
                      model.status === TrainingStatus.Finished
                        ? colours.grey
                        : colours.unavailable
                    }
                  />
                </button>
              </td>
              <td>
                <Link href={urls.train.view + '/' + model.modelName}>
                  <a>
                    <Eye color={colours.info} />
                  </a>
                </Link>
              </td>
              <td>
                <button onClick={() => _deleteModel(model.modelName)}>
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

type Status = {
  status: TrainingStatus;
};

const ModelStatusIndicator: React.FC<Status> = ({status}) => {
  switch (status) {
    case TrainingStatus.Waiting:
      return <Play color={colours.start} />;
    case TrainingStatus.Training:
      return <Loader color={colours.unavailable} className="animate-spin" />;
    case TrainingStatus.Finished:
      return <Check color={colours.grey} />;
    case TrainingStatus.Error:
      return <AlertTriangle color={colours.warning} />;
  }
};

export default ModelTable;
