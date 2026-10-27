import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { routes } from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export const app = express();

app.use(cors({ origin: env.corsOrigins }));
app.use(express.json({ limit: '1mb' }));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);
