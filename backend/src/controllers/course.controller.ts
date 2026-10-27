import type { Request, Response } from 'express';
import { courseService } from '../services/course.service.js';
import { HttpError } from '../middleware/httpError.js';

export const courseController = {
  list(_req: Request, res: Response) {
    res.json({ data: courseService.findAll() });
  },

  get(req: Request<{ id: string }>, res: Response) {
    const course = courseService.findById(req.params.id);
    if (!course) throw new HttpError(404, 'Không tìm thấy khóa học');
    res.json({ data: course });
  },
};
