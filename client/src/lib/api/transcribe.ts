import urls, {server} from 'lib/urls';

const url = server + urls.api.transcriptions;

export async function createTranscriptionJobs(
  files: File[],
  modelLocation: string
): Promise<Response> {
  const formData = new FormData();

  files.forEach(file => {
    formData.append('file', file);
  });
  formData.append('modelLocation', modelLocation);

  return fetch(url, {
    method: 'POST',
    mode: 'cors',
    body: formData,
  });
}

export async function transcribe(
  modelLocation: string,
  audioName: string
): Promise<Response> {
  return fetch(`${url}transcribe/${modelLocation}/${audioName}`);
}

export async function getTranscriptionStatus(
  modelLocation: string,
  audioName: string
): Promise<Response> {
  return fetch(`${url}status/${modelLocation}/${audioName}`);
}

export async function getText(
  modelLocation: string,
  audioName: string
): Promise<Response> {
  return fetch(`${url}text/${modelLocation}/${audioName}`, {});
}

export async function getElan(
  modelLocation: string,
  audioName: string
): Promise<Response> {
  return fetch(`${url}elan/${modelLocation}/${audioName}`, {});
}

export async function downloadFiles(): Promise<Response> {
  return fetch(`${url}download`);
}
