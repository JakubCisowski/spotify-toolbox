import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { trpc } from '../utils/trpc';
import Image from 'next/image';

const PlaylistPage: NextPage = () => {
  const router = useRouter();
  let id = (router.query.link as string)?.substring(34, 56);

  const { data, isLoading, error } = trpc.useQuery([
    'get-playlist-info',
    { playlistId: id },
  ]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error />;
  }

  return <Genres playlistData={data} />;
};

const Genres = ({ playlistData }: { playlistData: any }) => {
  const resultRows = [];
  let unclassified = playlistData.genres.pop();

  for (let i = 0; i < playlistData.genres.length && i < 10; i++) {
    resultRows.push(
      <div className="grid-item grid-item-left">
        <p className="grid-text">
          <span className="green-text">
            <b>{playlistData.genres[i].percentage}</b>
            <span className="percentage-text">%</span>
          </span>
        </p>
      </div>
    );
    resultRows.push(
      <div className="grid-item grid-item-right">
        <p className="grid-text">→ {playlistData.genres[i].genreName}</p>
      </div>
    );
  }

  return (
    <div className="genres-wrapper">
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
      {unclassified?.count > 0 ? (
        <p className="unclassified-text red-text">
          unclassified tracks: <b>{unclassified.percentage}</b>
          <span className="percentage-text">%</span>
        </p>
      ) : (
        <></>
      )}
    </div>
  );
};

const Loading = () => {
  return (
    <>
      <div className="loading-wrapper">
        <Image src="/loading.svg" alt="loading" width={200} height={200} />
        <p> for large playlists this might take up to 1 mintue </p>
      </div>
    </>
  );
};

const Error = () => {
  return <>Error</>;
};

export default PlaylistPage;
