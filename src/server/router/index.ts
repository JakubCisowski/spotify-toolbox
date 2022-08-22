// src/server/router/index.ts
import { TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { z } from 'zod';
import fetchPlaylistInfo from '../../utils/spotify';
import { createRouter } from './context';

export const appRouter = createRouter()
  .transformer(superjson)
  .query('get-playlist-info', {
    input: z.object({
      playlistId: z.string().length(22),
    }),
    async resolve({ input }) {
      try {
        const playlistInfo = await fetchPlaylistInfo(input.playlistId);
        return playlistInfo;
      } catch {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '(cutsom) Something went wrong',
        });
      }
    },
  });

// export type definition of API
export type AppRouter = typeof appRouter;
