import {useAtom} from 'jotai';
import fileDownload from 'js-file-download';
import {deleteModel, downloadModel, trainModel} from 'lib/api/models';
import colours from 'lib/colours';
import urls from 'lib/urls';
import Link from 'next/link';
import React from 'react';
import {Trash2, Eye, Download} from 'react-feather';
import {modelsAtom} from 'store';
import Model, {TrainingStatus} from 'types/Model';
import TrainingStatusIndicator from 'components/train/TrainingStatusIndicator';
import DataTable, {Section} from 'components/DataTable';

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

  const sections: Section<Model>[] = [
    {name: 'Model Name', display: model => model.modelName},
    {name: 'Dataset Name', display: model => model.datasetName},
    {
      name: 'Base Model',
      display: model =>
        model.baseModel ? (
          <a href={'https://huggingface.co/' + model.baseModel}>
            {model.baseModel}
          </a>
        ) : (
          <span>Unknown</span>
        ),
    },
    {name: 'Status', display: model => model.status},
    {
      name: 'Train',
      display: (model, index) => (
        <button
          onClick={() => _trainModel(index)}
          disabled={
            model.status === TrainingStatus.Training ||
            model.status === TrainingStatus.Finished
          }
        >
          <TrainingStatusIndicator
            status={model.status ?? TrainingStatus.Waiting}
          />
        </button>
      ),
    },

    {
      name: 'Download',
      display: model => (
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
      ),
    },
    {
      name: 'View',
      display: model => (
        <Link href={urls.train.view + '/' + model.modelName}>
          <a>
            <Eye color={colours.info} />
          </a>
        </Link>
      ),
    },
    {
      name: 'Delete',
      display: model => (
        <button onClick={() => _deleteModel(model.modelName)}>
          <Trash2 color={colours.delete} />
        </button>
      ),
    },
  ];

  if (models.length === 0) {
    return <p>No current models!</p>;
  }

  return (
    <div className="text-left w-full">
      <DataTable data={models} sections={sections} />
    </div>
  );
};

export default ModelTable;
