import urls, {serverRoute} from 'lib/urls';

const route = urls.api.transcriptions;

export async function getTranscriptions(): Promise<Response> {
  return fetch(serverRoute(route.index));
}

export async function resetTranscriptions(): Promise<Response> {
  return fetch(serverRoute(route.reset));
}

export async function deleteTranscription(
  modelLocation: string,
  audioName: string
): Promise<Response> {
  const params = new URLSearchParams({
    modelLocation,
    audioName,
  });
  const url = `${serverRoute(route.index)}?${params}`;
  return fetch(url, {
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

  return fetch(serverRoute(route.index), {
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
  return fetch(`${serverRoute(route.transcribe)}?${params}`);
}

export async function getTranscriptionStatus(
  modelLocation: string,
  audioName: string
): Promise<Response> {
  const params = new URLSearchParams({
    modelLocation,
    audioName,
  });
  return fetch(`${serverRoute(route.status)}?${params}`);
}

export async function getText(
  modelLocation: string,
  audioName: string
): Promise<Response> {
  const params = new URLSearchParams({
    modelLocation,
    audioName,
  });
  return fetch(`${serverRoute(route.text)}?${params}`);
}

export async function getElan(
  modelLocation: string,
  audioName: string
): Promise<Response> {
  const params = new URLSearchParams({
    modelLocation,
    audioName,
  });
  return fetch(`${serverRoute(route.elan)}?${params}`);
}

export async function downloadFiles(): Promise<Response> {
  return fetch(serverRoute(route.download));
}
