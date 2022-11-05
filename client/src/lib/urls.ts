export const server = 'http://localhost:5000';

export const urls = {
  models: {
    index: '/models',
    new: '/models/new',
    train: '/models/train',
    view: '/models/view',
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
