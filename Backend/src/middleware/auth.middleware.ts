import { Request, Response, NextFunction } from 'express';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  clearAuthCookies,
  getTokenFromAuthHeader,
  setAuthCookies,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../utils/authTokens';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = getTokenFromAuthHeader(req.headers.authorization) || req.cookies?.[ACCESS_TOKEN_COOKIE];
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    
    console.log(`[AUTH] Checking auth for: ${req.method} ${req.path}`);
    console.log(`[AUTH] Access token present: ${accessToken ? 'YES' : 'NO'}`);
    console.log(`[AUTH] Refresh token present: ${refreshToken ? 'YES' : 'NO'}`);

    if (accessToken) {
      const decoded = verifyAccessToken(accessToken);
      req.userId = decoded.userId;
      console.log(`[AUTH] User authenticated: ${decoded.userId}`);
      return next();
    }

    if (!refreshToken) {
      console.warn('[AUTH] No access token or refresh token found');
      return res.status(401).json({
        message: 'Authentication required',
        code: 'AUTH_TOKEN_MISSING',
      });
    }

    const decodedRefresh = verifyRefreshToken(refreshToken);
    const newAccessToken = signAccessToken({
      userId: decodedRefresh.userId,
      email: decodedRefresh.email,
    });
    const rotatedRefreshToken = signRefreshToken({
      userId: decodedRefresh.userId,
      email: decodedRefresh.email,
    });

    // Restore session seamlessly when only refresh token is available.
    setAuthCookies(res, newAccessToken, rotatedRefreshToken);
    req.userId = decodedRefresh.userId;

    console.log(`[AUTH] Session restored with refresh token for user: ${decodedRefresh.userId}`);
    return next();
  } catch (error: any) {
    console.error('[AUTH] Authentication error:', error.message);

    if (error.name === 'TokenExpiredError') {
      clearAuthCookies(res);
      return res.status(401).json({
        message: 'Session expired. Please log in again.',
        code: 'AUTH_TOKEN_EXPIRED',
      });
    }

    return res.status(401).json({
      message: 'Invalid authentication token',
      code: 'AUTH_TOKEN_INVALID',
    });
  }
};
