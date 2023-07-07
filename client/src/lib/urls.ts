export const host = 'http://localhost';

export const serverPort = process.env.SERVER_PORT ?? '5001';
export const server = `${host}:${serverPort}`;

export const tensorboardPort = process.env.TENSORBOARD_PORT ?? '6006';
export const tensorboard = `${host}:${tensorboardPort}`;

export const serverRoute = (route: string) => server + route;

export const urls = {
  train: {
    index: '/train',
    new: '/train/new',
    train: '/train/train',
    view: '/train/view',
    upload: '/train/upload',
  },
  datasets: {
    index: '/datasets',
    new: '/datasets/new',
    view: '/datasets/view',
  },
  transcriptions: {
    index: '/transcriptions',
    new: '/transcriptions/new',
    view: '/transcriptions/view',
  },
  api: {
    datasets: {
      index: '/api/datasets/', // Trailing slashes necessary for flask
      dataset: (datasetName: string) => `/api/datasets/${datasetName}`,
      download: (datasetName: string) =>
        `/api/datasets/download/${datasetName}`,
    },
    models: {
      index: '/api/models/',
      model: (modelName: string) => `/api/models/${modelName}`,
      train: (modelName: string) => `/api/models/train/${modelName}`,
      logs: (modelName: string) => `/api/models/logs/${modelName}`,
      status: (modelName: string) => `/api/models/status/${modelName}`,
      upload: '/api/models/upload',
      download: (modelName: string) => `/api/models/download/${modelName}`,
    },
    transcriptions: {
      index: '/api/transcriptions/',
      reset: '/api/transcriptions/reset',
      transcribe: '/api/transcriptions/transcribe',
      status: '/api/transcriptions/status',
      text: '/api/transcriptions/text',
      elan: '/api/transcriptions/elan',
      download: '/api/transcriptions/download',
    },
  },
} as const;

export default urls;
