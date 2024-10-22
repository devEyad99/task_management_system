//
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ICurrentUser } from '../interfaces/ICurrentUser';

dotenv.config();

type Payload = Record<string, unknown>;

function getEnvVariable(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value) {
    if (defaultValue) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
}

const SECRET_KEY = getEnvVariable('SECRET_KEY');
const REFRESH_TOKEN_SECRET = getEnvVariable('REFRESH_TOKEN_SECRET');

function grantToken(secret: string, expiresIn: string | number) {
  return function (data: Payload): string {
    const result = jwt.sign(data, secret, { expiresIn });
    return result;
  };
}

export const getAccessToken = grantToken(SECRET_KEY, '1m');
export const getRefreshToken = grantToken(REFRESH_TOKEN_SECRET, '5m');

function verifyToken(secret: string) {
  return function (token: string): ICurrentUser {
    const result = jwt.verify(token, secret) as ICurrentUser;
    return result;
  };
}

export const verifyRefreshToken = verifyToken(REFRESH_TOKEN_SECRET);
export const verifyAccessToken = verifyToken(SECRET_KEY);
