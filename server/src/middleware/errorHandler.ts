import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  // Mongoose duplicate key error
  if ((err as NodeJS.ErrnoException).name === 'MongoServerError') {
    const mongoErr = err as NodeJS.ErrnoException & { code?: number; keyValue?: Record<string, unknown> };
    if (mongoErr.code === 11000) {
      const field = Object.keys(mongoErr.keyValue || {})[0];
      res.status(400).json({
        success: false,
        message: `A record with this ${field} already exists.`,
      });
      return;
    }
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const mongoErr = err as NodeJS.ErrnoException & { errors?: Record<string, { message: string }> };
    const messages = Object.values(mongoErr.errors || {}).map((e) => e.message);
    res.status(400).json({ success: false, message: messages.join('. ') });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ success: false, message: 'Invalid token. Please log in again.' });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({ success: false, message: 'Your session has expired. Please log in again.' });
    return;
  }

  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' && statusCode === 500 ? 'Something went wrong' : message,
  });
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
};
