// src/server/router/index.ts
import { createRouter } from './context';
import superjson from 'superjson';
import { z } from 'zod';
import fetchPlaylistInfoAsync from '../../utils/spotify';

import { exampleRouter } from './example';

export const appRouter = createRouter()
  .transformer(superjson)
  .merge('example.', exampleRouter)
  .query('get-playlist-info', {
    input: z.object({
      playlistId: z.string(),
    }),
    async resolve({ input }) {
      console.log(input.playlistId);
      //const playlistInfo = await fetchPlaylistInfoAsync(input.playlistId);

      // return playlistInfo;
      // return 'xd';
    },
  });

// export type definition of API
export type AppRouter = typeof appRouter;
