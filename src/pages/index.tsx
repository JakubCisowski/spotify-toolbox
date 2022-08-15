import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { trpc } from '../utils/trpc';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>spotify toolbox</title>
        <meta name="description" content="Spotify toolbox website" />
        <link rel="icon" href="/website-icon.ico" />
      </Head>

      <div className="tutorial">
        <Tutorial />
      </div>
    </>
  );
};

function Tutorial() {
  return (
    <>
      <h3 className="tutorial-title">how it works?</h3>

      <p className="tutorial-text">1) copy spotify playlist link</p>

      <div className="image-wrapper">
        <Image
          src="https://i.imgur.com/qyY8xR4.gif"
          alt="tutorial1"
          width={847}
          height={631}
          className="tutorial-screenshot"
        ></Image>
      </div>

      <p className="tutorial-text">2) paste it and click analyze</p>

      <div className="image-wrapper">
        <Image
          src="https://i.imgur.com/XqQUuMo.gif"
          alt="tutorial2"
          className="tutorial-screenshot"
          width={1142}
          height={137}
        ></Image>
      </div>

      <p className="tutorial-text"> 3) wait for the analysis to finish </p>

      <div className="image-wrapper">
        <Image
          src="https://i.imgur.com/UnSukGJ.gif"
          alt="tutorial3"
          className="tutorial-screenshot"
          width={425}
          height={162}
        ></Image>
      </div>

      <p className="tutorial-text"> 4) check analysis result </p>

      <div className="image-wrapper">
        <Image
          src="https://i.imgur.com/JBV1uiX.png"
          alt="tutorial4"
          className="tutorial-screenshot"
          width={422}
          height={694}
        ></Image>
      </div>

      <p className="tutorial-text">
        <span className="green-text">
          <b>70</b>
          <span className="percentage-text">% </span>
        </span>
        this means that 70% of the tracks* in this playlist are classified by
        Spotify as a certain genre of music
      </p>
      <p className="tutorial-text">
        some tracks are <span className="red-text">not classified</span>,
        it&apos;s indicated at the botom of analysis results
      </p>
      <hr></hr>
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
