import { initTRPC } from '@trpc/server';
import { z } from 'zod';

/**
 * Inițializarea tRPC. Acest lucru este făcut o singură dată pe backend.
 */
const t = initTRPC.create();

/**
 * Exportăm procedurile de bază pentru a fi folosite în routere.
 */
export const router = t.router;
export const publicProcedure = t.procedure;
