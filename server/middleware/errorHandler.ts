import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return res.status(400).json({
      error: true,
      message: 'Invalid JSON payload format received.',
    });
  }

  console.error('🔥 Server Error:', err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: true,
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : message,
  });
}
