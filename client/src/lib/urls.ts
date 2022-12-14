export const host = 'http://localhost';

export const serverPort = process.env.SERVER_PORT ?? '5001';
export const server = `${host}:${serverPort}`;

export const tensorboardPort = process.env.TENSORBOARD_PORT ?? '6006';
export const tensorboard = `${host}:${tensorboardPort}`;

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
    datasets: '/api/datasets/',
    models: '/api/models/',
    transcriptions: '/api/transcriptions/',
  },
};

export default urls;
