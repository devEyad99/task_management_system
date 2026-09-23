//
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AuthTokenPayload } from '../interfaces/ICurrentUser';
import { USER_ROLES, UserRole } from '../models/user.model';

dotenv.config();

function getEnvVariable(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  if (process.env.NODE_ENV === 'production' && value.length < 32) {
    throw new Error(`Environment variable ${key} must be at least 32 characters`);
  }
  return value;
}

const SECRET_KEY = getEnvVariable('SECRET_KEY');
const REFRESH_TOKEN_SECRET = getEnvVariable('REFRESH_TOKEN_SECRET');

function grantToken(secret: string, expiresIn: '1h' | '1d') {
  return function (data: AuthTokenPayload): string {
    return jwt.sign(data, secret, { algorithm: 'HS256', expiresIn });
  };
}

export const getAccessToken = grantToken(SECRET_KEY, '1h');
export const getRefreshToken = grantToken(REFRESH_TOKEN_SECRET, '1d');

function verifyToken(secret: string) {
  return function (token: string): AuthTokenPayload {
    const result = jwt.verify(token, secret, { algorithms: ['HS256'] });
    if (
      typeof result === 'string' ||
      !Number.isSafeInteger(result.id) ||
      typeof result.email !== 'string' ||
      typeof result.role !== 'string' ||
      !USER_ROLES.includes(result.role as UserRole)
    ) {
      throw new jwt.JsonWebTokenError('Invalid token payload');
    }
    return { id: result.id, email: result.email, role: result.role as UserRole };
  };
}

export const verifyRefreshToken = verifyToken(REFRESH_TOKEN_SECRET);
export const verifyAccessToken = verifyToken(SECRET_KEY);
