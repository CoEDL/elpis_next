import {serializeModel} from 'lib/models';
import urls, {serverRoute} from 'lib/urls';
import Model from 'types/Model';

const route = urls.api.models;

export async function getModels(): Promise<Response> {
  return fetch(serverRoute(route.index));
}

export async function createModel(model: Model): Promise<Response> {
  return fetch(serverRoute(route.index), {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify(serializeModel(model)),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function deleteModel(modelName: string): Promise<Response> {
  return fetch(serverRoute(route.model(modelName)), {
    mode: 'cors',
    method: 'DELETE',
  });
}

export async function trainModel(modelName: string): Promise<Response> {
  return fetch(serverRoute(route.train(modelName)));
}

export async function getModelLogs(modelName: string): Promise<Response> {
  return fetch(serverRoute(route.logs(modelName)));
}

export async function getModelStatus(modelName: string): Promise<Response> {
  return fetch(serverRoute(route.status(modelName)));
}

export async function uploadModel(modelZip: File): Promise<Response> {
  const formData = new FormData();
  formData.append('file', modelZip);

  return fetch(serverRoute(route.upload), {
    method: 'POST',
    mode: 'cors',
    body: formData,
  });
}

export async function downloadModel(modelName: string): Promise<Response> {
  return fetch(serverRoute(route.download(modelName)));
}
