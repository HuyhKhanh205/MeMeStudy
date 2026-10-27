import type { Request, Response } from 'express';
import { studyFileService } from '../services/studyFile.service.js';
import { HttpError } from '../middleware/httpError.js';
import type { CreateStudyFileInput } from '../validators/studyFile.validator.js';

export const studyFileController = {
  list(_req: Request, res: Response) {
    res.json({ data: studyFileService.findAll() });
  },

  create(req: Request<object, object, CreateStudyFileInput>, res: Response) {
    res.status(201).json({ data: studyFileService.create(req.body) });
  },

  remove(req: Request<{ id: string }>, res: Response) {
    if (!studyFileService.remove(req.params.id)) {
      throw new HttpError(404, 'Không tìm thấy tài liệu');
    }
    res.status(204).end();
  },
};
