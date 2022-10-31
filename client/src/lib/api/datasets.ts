import urls, {server} from 'lib/urls';
import {CleaningOptions, Dataset, ElanOptions} from 'types/Dataset';

export async function getDatasets(): Promise<Dataset[]> {
  const response = await fetch(server + urls.api.datasets);
  const data = await response.json();
  return data.datasets as Dataset[];
}

export async function createDataset(
  name: string,
  files: File[],
  cleaningOptions: CleaningOptions,
  elanOptions?: ElanOptions
): Promise<void> {
  const formData = new FormData();

  formData.append('name', name);
  files.forEach(file => {
    formData.append('file', file);
  });
  formData.append('cleaningOptions', JSON.stringify(cleaningOptions));
  if (files.some(file => file.name.endsWith('.eaf'))) {
    formData.append('elanOptions', JSON.stringify(elanOptions));
  }

  await fetch(server + urls.api.datasets, {
    method: 'POST',
    mode: 'cors',
    body: formData,
  });
}

export async function deleteDataset(name: string): Promise<void> {
  await fetch(`${server}${urls.api.datasets}${name}`, {
    mode: 'cors',
    method: 'DELETE',
  });
}
