import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
import { Role } from '../../shared/types.js';

export function requireRoles(allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden. Role '${req.user.role}' does not have access to this resource.`,
      });
    }

    next();
  };
}
