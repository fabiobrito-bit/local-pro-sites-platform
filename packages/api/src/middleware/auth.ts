import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt.js';
import { db } from '../models/db.js';
import { sessions } from '../models/schema.js';
import { eq } from 'drizzle-orm';

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Niet geautoriseerd' });
    }
    const payload = verifyToken(token);
    // Verify session exists and is not expired
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.sessionToken, token))
      .limit(1);
    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Sessie verlopen' });
    }
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      adminRole: payload.adminRole,
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Ongeldige token' });
  }
}

export const requireAuth = authenticate;

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin rechten vereist' });
  }
  next();
}

export function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin' || req.user.adminRole !== 'super_admin') {
    return res.status(403).json({ error: 'Super admin rechten vereist' });
  }
  next();
}
