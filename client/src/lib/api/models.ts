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

export async function deleteModel(name: string): Promise<Response> {
  return fetch(`${url}${name}`, {
    mode: 'cors',
    method: 'DELETE',
  });
}

export async function trainModel(name: string): Promise<Response> {
  return fetch(`${url}train/${name}`);
}

export async function getModelStatus(name: string): Promise<Response> {
  return fetch(`${url}status/${name}`);
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

export async function downloadModel(name: string): Promise<Response> {
  return fetch(`${url}download/${name}`);
}
