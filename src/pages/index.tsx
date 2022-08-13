import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { trpc } from '../utils/trpc';

const Home: NextPage = () => {
  const [playlistLink, setPlaylistLink] = useState('');

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
        <PlaylistSearchbar
          playlistLink={playlistLink}
          onPlaylistLinkChange={setPlaylistLink}
        />
        <TutorialSection />
      </div>
    </>
  );
};

function Logo() {
  return (
    <>
      <Link href="/">
        <a className="logo-text">
          <span className="green">spotify</span> toolbox • find playlist genre
        </a>
      </Link>
    </>
  );
}

function PlaylistSearchbar({
  playlistLink,
  onPlaylistLinkChange,
}: {
  playlistLink: string;
  onPlaylistLinkChange: (playlistLink: string) => void;
}) {
  return (
    <>
      <form action="/playlist-genre" method="get">
        <input
          type="text"
          name="link"
          placeholder="paste spotify playlist link"
          value={playlistLink}
          onChange={(e) => onPlaylistLinkChange(e.target.value)}
          className="input-text-style"
        />
        <input type="submit" value="analyze" className="input-submit-style" />
      </form>
    </>
  );
}

function TutorialSection() {
  return (
    <>
      <h3>how it works?</h3>
      <p>1) copy spotify playlist link</p>
      <Image
        src="https://i.imgur.com/qyY8xR4.gif"
        alt="tutorial1"
        className="how-it-works-resource"
        width={847}
        height={631}
      ></Image>
      <p>2) paste it and click analyze</p>
      <Image
        src="https://i.imgur.com/XqQUuMo.gif"
        alt="tutorial2"
        className="how-it-works-resource"
        width={1142}
        height={137}
      ></Image>
      <p> 3) wait for the analysis to finish </p>
      <Image
        src="https://i.imgur.com/UnSukGJ.gif"
        alt="tutorial3"
        className="how-it-works-resource"
        width={425}
        height={162}
      ></Image>
      <p> 4) check analysis result </p>
      <Image
        src="https://i.imgur.com/JBV1uiX.png"
        alt="tutorial4"
        className="how-it-works-resource"
        width={422}
        height={694}
      ></Image>
      <p>
        <span className="green">
          <b>70</b>
          <span className="percentage">% </span>
        </span>
        this means that 70% of the tracks* in this playlist are classified by
        Spotify as a certain genre of music
      </p>
      <p>
        some tracks are <span className="red">not classified</span>, it&apos;s
        indicated at the botom of analysis results
      </p>
      <p> --- </p>
      <p className="side-note">
        <em>
          * actually Spotify classifies artists rather than tracks, so to be
          precise 70% means that 70% of the tracks in this playlist were created
          by artists related to the genre
        </em>
      </p>
    </>
  );
}

export default Home;
