import urls, {serverRoute} from 'lib/urls';
import {CleaningOptions, ElanOptions} from 'types/Dataset';

const route = urls.api.datasets;

export async function getDatasets(): Promise<Response> {
  return fetch(serverRoute(route.index));
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

  return fetch(serverRoute(route.index), {
    method: 'POST',
    mode: 'cors',
    body: formData,
  });
}

export async function deleteDataset(name: string): Promise<Response> {
  return fetch(serverRoute(route.dataset(name)), {
    mode: 'cors',
    method: 'DELETE',
  });
}

export async function downloadDataset(name: string): Promise<Response> {
  return fetch(serverRoute(route.download(name)));
}
