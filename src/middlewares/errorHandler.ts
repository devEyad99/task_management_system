import { ErrorRequestHandler, RequestHandler } from 'express';
import multer from 'multer';
import {
  ForeignKeyConstraintError,
  UniqueConstraintError,
  ValidationError,
} from 'sequelize';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AppError } from '../errors/AppError';

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
      ...(error.details === undefined ? {} : { details: error.details }),
    });
    return;
  }

  if (error instanceof UniqueConstraintError) {
    res.status(409).json({ message: 'A record with that value already exists' });
    return;
  }

  if (error instanceof ValidationError) {
    res.status(400).json({
      message: 'Validation failed',
      details: error.errors.map((item) => item.message),
    });
    return;
  }

  if (error instanceof ForeignKeyConstraintError) {
    res.status(409).json({ message: 'Operation conflicts with related records' });
    return;
  }

  if (error instanceof TokenExpiredError || error instanceof JsonWebTokenError) {
    res.status(401).json({ message: 'Invalid token. Please log in again.' });
    return;
  }

  if (error instanceof multer.MulterError) {
    const message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'Image must not exceed 1 MB'
        : 'Invalid file upload';
    res.status(400).json({ message });
    return;
  }

  if (
    error instanceof SyntaxError &&
    'status' in error &&
    error.status === 400
  ) {
    res.status(400).json({ message: 'Invalid JSON body' });
    return;
  }

  if (process.env.NODE_ENV === 'production') {
    console.error(
      'Unhandled request error:',
      error instanceof Error ? error.name : 'UnknownError'
    );
  } else {
    console.error('Unhandled request error:', error);
  }
  res.status(500).json({ message: 'Internal Server Error' });
};
