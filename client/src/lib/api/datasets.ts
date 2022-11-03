import urls, {server} from 'lib/urls';
import {CleaningOptions, ElanOptions} from 'types/Dataset';

export async function getDatasets(): Promise<Response> {
  return fetch(server + urls.api.datasets);
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

  return fetch(server + urls.api.datasets, {
    method: 'POST',
    mode: 'cors',
    body: formData,
  });
}

export async function deleteDataset(name: string): Promise<Response> {
  return fetch(`${server}${urls.api.datasets}${name}`, {
    mode: 'cors',
    method: 'DELETE',
  });
}
