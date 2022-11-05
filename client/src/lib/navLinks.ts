import MenuLink from 'types/menuLink';
import urls from './urls';

export const navLinks: MenuLink[] = [
  {
    name: 'Home',
    url: '/',
  },
  {
    name: 'Datasets',
    url: urls.datasets.index,
  },
  {
    name: 'Models',
    url: urls.models.index,
  },
  {
    name: 'Transcribe',
    url: urls.transcriptions.index,
  },
];

export default navLinks;
