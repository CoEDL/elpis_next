import urls, {server} from 'lib/urls';

const url = server + urls.api.reset;

export async function resetApp(): Promise<Response> {
  return fetch(url);
}
