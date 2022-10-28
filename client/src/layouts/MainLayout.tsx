import Head from 'next/head';
import {ReactNode} from 'react';
import Footer from 'components/Footer';
import Header from 'components/Header';

interface layoutProps {
  children: ReactNode;
}

export default function MainLayout({children}: layoutProps) {
  return (
    <div>
      <Head>
        <title>Elpis</title>
        {/**
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        */}
      </Head>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-white">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
