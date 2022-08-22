// src/pages/_app.tsx
import { withTRPC } from '@trpc/next';
import type { AppRouter } from '../server/router';
import type { AppType } from 'next/dist/shared/lib/utils';
import superjson from 'superjson';
import '../styles/globals.css';
import '../styles/index.css';
import '../styles/playlist.css';
import Logo from '../components/logo';
import { useState } from 'react';
import Searchbar from '../components/searchbar';
import Head from 'next/head';

const MyApp: AppType = ({ Component, pageProps }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <Head>
        <title>spotify toolbox</title>
        <link rel="icon" href="/website_icon.png" />
      </Head>
      <div className="body-wrapper">
        <div className="logo">
          <Logo />
        </div>
        <div className="searchbar">
          <Searchbar isLoading={isLoading} />
        </div>
        <hr></hr>
        <Component {...pageProps} setIsLoading={setIsLoading} />
      </div>
    </>
  );
};

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return '';
  }
  if (process.browser) return ''; // Browser should use current path
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url

  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export default withTRPC<AppRouter>({
  config({ ctx }) {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    const url = `${getBaseUrl()}/api/trpc`;

    return {
      url,
      transformer: superjson,
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: false,
})(MyApp);
