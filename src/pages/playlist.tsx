import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { trpc } from '../utils/trpc';

const PlaylistPage: NextPage = () => {
  const router = useRouter();
  let id = (router.query.link as string)?.substring(34, 56);

  const { data, isLoading } = trpc.useQuery([
    'get-playlist-info',
    { playlistId: id },
  ]);

  return (
    <>
      Playlist id: {id}{' '}
      <div>{data ? <p>{JSON.stringify(data)}</p> : <p>Loading..</p>}</div>
    </>
  );
};

export default PlaylistPage;
