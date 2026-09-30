import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { UserSession } from '../../shared/types.js';

export interface AuthenticatedRequest extends Request {
  user?: UserSession;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  const session = verifyToken(token);

  if (!session) {
    return res.status(401).json({ message: 'Session expired or invalid token' });
  }

  req.user = session;
  next();
}
