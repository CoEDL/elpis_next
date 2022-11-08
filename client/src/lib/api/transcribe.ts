import urls, {server} from 'lib/urls';

const url = server + urls.api.transcriptions;

export async function resetTranscriptions(): Promise<Response> {
  return fetch(url + 'reset');
}

export async function getTranscriptions(): Promise<Response> {
  return fetch(url);
}

export async function deleteTranscription(
  modelLocation: string,
  audioName: string
): Promise<Response> {
  const params = new URLSearchParams({
    modelLocation,
    audioName,
  });
  return fetch(`${url}?${params}`, {
    method: 'DELETE',
    mode: 'cors',
  });
}

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
  const params = new URLSearchParams({
    modelLocation,
    audioName,
  });
  return fetch(`${url}transcribe?${params}`);
}

export async function getTranscriptionStatus(
  modelLocation: string,
  audioName: string
): Promise<Response> {
  const params = new URLSearchParams({
    modelLocation,
    audioName,
  });
  return fetch(`${url}status?${params}`);
}

export async function getText(
  modelLocation: string,
  audioName: string
): Promise<Response> {
  const params = new URLSearchParams({
    modelLocation,
    audioName,
  });
  return fetch(`${url}text?${params}`);
}

export async function getElan(
  modelLocation: string,
  audioName: string
): Promise<Response> {
  const params = new URLSearchParams({
    modelLocation,
    audioName,
  });
  return fetch(`${url}elan?${params}`);
}

export async function downloadFiles(): Promise<Response> {
  return fetch(`${url}download`);
}
