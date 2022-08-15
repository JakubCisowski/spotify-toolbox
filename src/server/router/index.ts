// src/server/router/index.ts
import { createRouter } from './context';
import superjson from 'superjson';
import { z } from 'zod';
import fetchPlaylistInfoAsync from '../../utils/spotify';
import { trpc } from '../../utils/trpc';
import { TRPCError } from '@trpc/server';

export const appRouter = createRouter()
  .transformer(superjson)
  .query('get-playlist-info', {
    input: z.object({
      playlistId: z.string().length(22),
    }),
    async resolve({ input }) {
      try {
        const playlistInfo = await fetchPlaylistInfoAsync(input.playlistId);
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
