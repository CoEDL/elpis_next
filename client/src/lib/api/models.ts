import urls, {server} from 'lib/urls';
import Model from 'types/Model';

const url = server + urls.api.models;

export async function getModels(): Promise<Response> {
  return fetch(url);
}

export async function createModel(model: Model): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify(model),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function deleteModel(modelName: string): Promise<Response> {
  return fetch(`${url}${modelName}`, {
    mode: 'cors',
    method: 'DELETE',
  });
}

export async function trainModel(modelName: string): Promise<Response> {
  return fetch(`${url}train/${modelName}`);
}

export async function getModelLogs(modelName: string): Promise<Response> {
  return fetch(`${url}logs/${modelName}`);
}

export async function getModelStatus(modelName: string): Promise<Response> {
  return fetch(`${url}status/${modelName}`);
}

export async function uploadModel(modelZip: File): Promise<Response> {
  const formData = new FormData();
  formData.append('file', modelZip);

  return fetch(`${url}upload`, {
    method: 'POST',
    mode: 'cors',
    body: formData,
  });
}

export async function downloadModel(modelName: string): Promise<Response> {
  return fetch(`${url}download/${modelName}`);
}
