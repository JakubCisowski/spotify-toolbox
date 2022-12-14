import type { NextPage } from 'next';
import Image from 'next/image';

const Home: NextPage = () => {
  return (
    <>
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

      <p className="tutorial-text">2) paste it here</p>

      <div className="image-wrapper">
        <Image
          src="https://i.imgur.com/RolCFB5.png"
          alt="tutorial2"
          className="tutorial-screenshot"
          width={1033}
          height={88}
        ></Image>
      </div>

      <p className="tutorial-text"> 3) wait for the analysis to finish </p>

      <div className="image-wrapper">
        <Image
          src="https://i.imgur.com/lpZv9Cp.gif"
          alt="tutorial3"
          className="tutorial-screenshot"
          width={520}
          height={256}
        ></Image>
      </div>

      <p className="tutorial-text"> 4) check analysis result </p>

      <div className="image-wrapper">
        <Image
          src="https://i.imgur.com/MLD8kRC.png"
          alt="tutorial4"
          className="tutorial-screenshot"
          width={499}
          height={766}
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
