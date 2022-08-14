// src/server/router/index.ts
import { createRouter } from './context';
import superjson from 'superjson';
import { z } from 'zod';
import fetchPlaylistInfoAsync from '../../utils/spotify';

export const appRouter = createRouter()
  .transformer(superjson)
  .query('get-playlist-info', {
    input: z.object({
      playlistId: z.string(),
    }),
    async resolve({ input }) {
      const playlistInfo = await fetchPlaylistInfoAsync(input.playlistId);

      return playlistInfo;
      // return 'xd';
    },
  });

// export type definition of API
export type AppRouter = typeof appRouter;
