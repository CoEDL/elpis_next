export const server = 'http://localhost:5000';

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
