import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { trpc } from '../utils/trpc';

const Home: NextPage = () => {
  const { data, isLoading } = trpc.useQuery([
    'example.hello',
    { text: 'from tRPC' },
  ]);

  return (
    <>
      <Head>
        <title>spotify toolbox</title>
        <meta name="description" content="Spotify toolbox website" />
        <link rel="icon" href="/website-icon.ico" />
      </Head>

      <div>{data ? <p>{data.greeting}</p> : <p>Loading..</p>}</div>

      <div>
        <Logo />
        <PlaylistSearchbar />
      </div>
    </>
  );
};

function Logo() {
  return (
    <>
      <h2> spotify toolbox • find playlist genre </h2>
    </>
  );
}

function PlaylistSearchbar() {
  return (
    <>
      <form action="/playlist-genre" method="get">
        <input
          type="text"
          name="link"
          placeholder="paste spotify playlist link"
          value=""
        />
        <input type="submit" value="analyze" />
      </form>
    </>
  );
}

export default Home;
