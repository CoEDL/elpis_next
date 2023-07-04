import urls, {server} from 'lib/urls';

const baseURL = server + urls.api.transcriptions;

export async function getTranscriptions(): Promise<Response> {
  return fetch(baseURL);
}

export async function resetTranscriptions(): Promise<Response> {
  return fetch(baseURL + '/reset');
}

export async function deleteTranscription(
  modelLocation: string,
  audioName: string
): Promise<Response> {
  const params = new URLSearchParams({
    modelLocation,
    audioName,
  });
  return fetch(`${baseURL}?${params}`, {
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

  return fetch(baseURL, {
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
  return fetch(`${baseURL}/transcribe?${params}`);
}

export async function getTranscriptionStatus(
  modelLocation: string,
  audioName: string
): Promise<Response> {
  const params = new URLSearchParams({
    modelLocation,
    audioName,
  });
  return fetch(`${baseURL}/status?${params}`);
}

export async function getText(
  modelLocation: string,
  audioName: string
): Promise<Response> {
  const params = new URLSearchParams({
    modelLocation,
    audioName,
  });
  return fetch(`${baseURL}/text?${params}`);
}

export async function getElan(
  modelLocation: string,
  audioName: string
): Promise<Response> {
  const params = new URLSearchParams({
    modelLocation,
    audioName,
  });
  return fetch(`${baseURL}/elan?${params}`);
}

export async function downloadFiles(): Promise<Response> {
  return fetch(`${baseURL}/download`);
}
