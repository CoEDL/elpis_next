import urls, {server} from 'lib/urls';
import {CleaningOptions, ElanOptions} from 'types/Dataset';

const baseURL = server + urls.api.datasets;

export async function getDatasets(): Promise<Response> {
  return fetch(baseURL);
}

export async function createDataset(
  name: string,
  files: File[],
  cleaningOptions: CleaningOptions,
  elanOptions?: ElanOptions
): Promise<Response> {
  const formData = new FormData();

  formData.append('name', name);
  files.forEach(file => {
    formData.append('file', file);
  });
  formData.append('cleaningOptions', JSON.stringify(cleaningOptions));
  if (files.some(file => file.name.endsWith('.eaf'))) {
    formData.append('elanOptions', JSON.stringify(elanOptions));
  }

  return fetch(baseURL, {
    method: 'POST',
    mode: 'cors',
    body: formData,
  });
}

export async function deleteDataset(name: string): Promise<Response> {
  return fetch(`${baseURL}/${name}`, {
    mode: 'cors',
    method: 'DELETE',
  });
}

export async function downloadDataset(name: string): Promise<Response> {
  return fetch(`${baseURL}/download/${name}`);
}
