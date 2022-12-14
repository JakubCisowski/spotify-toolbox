import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { trpc } from '../utils/trpc';

export default function PlaylistPage() {
  const router = useRouter();
  let id = (router.query.link as string)?.substring(34, 56);

  const { data, isLoading, error } = trpc.useQuery(
    ['get-playlist-info', { playlistId: id }],
    {
      retry: false,
      staleTime: Infinity, // ? maybe it shouldnt be infinite, but since nobody uses my website it doesn't matter
    }
  );

  if (isLoading) {
    return <Loading />;
  }

  if (error || data == undefined) {
    return <Error />;
  }

  return <Genres playlistData={data} />;
}

const Genres = ({
  playlistData,
}: {
  playlistData: {
    name: string;
    imageUrl: string;
    genres: { genreName: string; count: number; percentage: number }[];
  };
}) => {
  useEffect(() => {
    document.title = `${playlistData.name} • spotify toolbox`;
  });

  const resultRows = [];
  let myRef = useRef<HTMLDivElement>(null);

  let scroll = () => {
    window.scrollTo({ behavior: 'smooth', top: myRef.current!.offsetTop - 60 });
  };

  for (let i = 0; i < playlistData.genres.length - 1 && i < 10; i++) {
    let percentage = playlistData.genres[i]!.percentage;
    if (percentage == 0) break;
    resultRows.push(
      <div key={i + '-percentage'} className="grid-item grid-item-left">
        <p className="grid-text">
          <span className="green-text">
            <b>{percentage}</b>
            <span className="percentage-text">%</span>
          </span>
        </p>
      </div>
    );
    resultRows.push(
      <div key={i + '-name'} className="grid-item grid-item-right">
        <p className="grid-text">→ {playlistData.genres[i]!.genreName}</p>
      </div>
    );
  }

  let unclassifiedPercentage =
    playlistData.genres[playlistData.genres.length - 1]?.percentage;

  return (
    <>
      <div ref={myRef} onLoad={scroll} className="genres-wrapper">
        <p className="genres-header">{playlistData.name}</p>
        <div className="playlist-image-wrapper">
          <Image
            src={playlistData.imageUrl}
            alt="playlist"
            className="playlist-image"
            width={200}
            height={200}
          />
        </div>

        <div className="grid-container">{resultRows}</div>
        {unclassifiedPercentage! > 0 ? (
          <p className="unclassified-text red-text">
            unclassified tracks: <b>{unclassifiedPercentage}</b>
            <span className="percentage-text">%</span>
          </p>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

const Loading = () => {
  useEffect(() => {
    document.title = 'loading... • spotify toolbox';
  });
  return (
    <>
      <div className="loading-wrapper">
        <Image src="/loading.svg" alt="loading" width={200} height={200} />
        <p>for large playlists this might take up to 10 seconds</p>
      </div>
    </>
  );
};

const Error = () => {
  useEffect(() => {
    document.title = 'error • spotify toolbox';
  });
  return (
    <>
      <p className="error-text">
        too large playlist, is it over 1500 songs?<br></br>
        or invalid playlist link!
      </p>
    </>
  );
};
