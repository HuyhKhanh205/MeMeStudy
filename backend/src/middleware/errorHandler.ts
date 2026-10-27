import type { ErrorRequestHandler, RequestHandler } from 'express';
import { HttpError } from './httpError.js';

export const notFound: RequestHandler = (req, _res, next) => {
  next(new HttpError(404, `Không tìm thấy ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message, details: err.details });
    return;
  }
  console.error(err);
  res.status(500).json({ message: 'Lỗi máy chủ' });
};
