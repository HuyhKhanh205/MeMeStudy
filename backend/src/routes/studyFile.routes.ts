import { Router } from 'express';
import { studyFileController } from '../controllers/studyFile.controller.js';
import { validateBody } from '../middleware/validate.js';
import { createStudyFileSchema } from '../validators/studyFile.validator.js';

export const studyFileRoutes = Router();

studyFileRoutes.get('/', studyFileController.list);
studyFileRoutes.post('/', validateBody(createStudyFileSchema), studyFileController.create);
studyFileRoutes.delete('/:id', studyFileController.remove);
