import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utiles/jwt';
import { RequestWithUser } from '../interfaces/RequestWithUser';

export const authenticate = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    res
      .status(401)
      .json({ message: 'You are not logged in! Please log in to get access.' });
    return;
  }

  try {
    const currentUser = verifyAccessToken(token);
    req.currentUser = currentUser;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(403).json({ message: 'Invalid token. Please log in again.' });
    return;
  }
};
