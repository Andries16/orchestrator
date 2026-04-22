import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import * as trpcExpress from '@trpc/server/adapters/express';
import { connectDB } from './db.js';
import { appRouter } from './routers/index.js';

async function startServer() {
  // Conectare la baza de date
  await connectDB();

  const app = express();
  // NOTĂ: Folosim portul 3000 conform constrângerilor mediului de rulare (AI Studio).
  const PORT = 3000;

  // Middleware tRPC
  app.use(
    '/api/trpc',
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext: () => ({}),
    })
  );

  // API Routes (vom adăuga tRPC aici ulterior)
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', project: 'cross_brand' });
  });

  // Configurare Vite ca Middleware (pentru dezvoltare)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: path.resolve(process.cwd(), 'apps/frontend'),
    });
    app.use(vite.middlewares);
  } else {
    // Configurare pentru producție
    const distPath = path.resolve(process.cwd(), 'apps/frontend/dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BACKEND] Serverul cross_brand rulează pe http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
