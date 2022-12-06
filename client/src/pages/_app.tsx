import 'styles/globals.css';
import {NextPage} from 'next';
import {AppProps} from 'next/app';
import MainLayout from 'layouts/MainLayout';
import {appWithTranslation} from 'next-i18next';
import nextI18nextConfig from '../../next-i18next.config.js';

type PageWithLayout = NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactElement;
};

function MyApp({Component, pageProps}: AppProps) {
  const getLayout =
    (Component as PageWithLayout).getLayout ||
    (page => <MainLayout>{page}</MainLayout>);
  return getLayout(<Component {...pageProps} />);
}

export default appWithTranslation(MyApp, nextI18nextConfig);
