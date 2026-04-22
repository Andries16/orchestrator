import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../backend/src/routers/index.ts';

/**
 * Creăm hook-urile tRPC tipizate folosind AppRouter din backend.
 */
export const trpc = createTRPCReact<AppRouter>();
