import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utiles/jwt';
import { User } from '../models';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
    const user = await User.findOne({ where: { id: currentUser.id } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    req.currentUser = user;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(403).json({ message: 'Invalid token. Please log in again.' });
    return;
  }
};
