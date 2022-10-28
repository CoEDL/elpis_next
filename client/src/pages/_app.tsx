import 'styles/globals.css';
import {NextPage} from 'next';
import {AppProps} from 'next/app';
import MainLayout from 'layouts/MainLayout';

type PageWithLayout = NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactElement;
};

function MyApp({Component, pageProps}: AppProps) {
  const getLayout =
    (Component as PageWithLayout).getLayout ||
    (page => <MainLayout>{page}</MainLayout>);
  return getLayout(<Component {...pageProps} />);
}

export default MyApp;
