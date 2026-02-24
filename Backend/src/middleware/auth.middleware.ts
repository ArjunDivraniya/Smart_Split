import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check for token in Authorization header or cookies
    let token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;
    
    console.log(`[AUTH] Checking auth for: ${req.method} ${req.path}`);
    console.log(`[AUTH] Token present: ${token ? 'YES' : 'NO'}`);

    if (!token) {
      console.error('[AUTH] ❌ No token found');
      return res.status(401).json({ message: 'Authentication token missing' });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('[AUTH] ❌ JWT_SECRET not configured');
      throw new Error('JWT_SECRET is not defined');
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    req.userId = decoded.userId;
    
    console.log(`[AUTH] βœ… User authenticated: ${decoded.userId}`);
    next();
  } catch (error: any) {
    console.error('[AUTH] ❌ Authentication error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};
