import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utiles/jwt';
import { User } from '../models';
import { AppError } from '../errors/AppError';

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const [scheme, token] = authHeader?.split(' ') ?? [];

  if (scheme !== 'Bearer' || !token) {
    next(
      new AppError(
        401,
        'You are not logged in! Please log in to get access.'
      )
    );
    return;
  }

  try {
    const currentUser = verifyAccessToken(token);
    const user = await User.findByPk(currentUser.id);
    if (!user) {
      next(new AppError(401, 'The user for this token no longer exists'));
      return;
    }

    req.currentUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile_image: user.profile_image,
    };
    next();
  } catch {
    next(new AppError(401, 'Invalid token. Please log in again.'));
  }
};
