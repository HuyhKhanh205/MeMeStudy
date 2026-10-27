import { Router } from 'express';
import { courseRoutes } from './course.routes.js';
import { studyFileRoutes } from './studyFile.routes.js';

export const routes = Router();

routes.get('/health', (_req, res) => {
  res.json({ data: { status: 'ok' } });
});
routes.use('/courses', courseRoutes);
routes.use('/study-files', studyFileRoutes);
