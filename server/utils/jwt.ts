import jwt from 'jsonwebtoken';
import { UserSession } from '../../shared/types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'jaipur_public_school_super_secret_jwt_key_2026';

export function generateToken(payload: UserSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch (error) {
    return null;
  }
}
