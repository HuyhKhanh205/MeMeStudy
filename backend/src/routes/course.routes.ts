import { Router } from 'express';
import { courseController } from '../controllers/course.controller.js';

export const courseRoutes = Router();

courseRoutes.get('/', courseController.list);
courseRoutes.get('/:id', courseController.get);
