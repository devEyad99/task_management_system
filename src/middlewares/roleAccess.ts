//
import { Response, NextFunction } from 'express';
import { RequestWithUser } from '../interfaces/RequestWithUser';
export const adminRole = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const role = req.currentUser?.role;
  if (role !== 'admin') {
    return res.status(403).json({
      extra: 'admin role',
      message: 'You are not authorized to access this route',
    });
  }
  next();
};

export const managerRole = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const role = req.currentUser?.role;
  if (role !== 'manager' && role !== 'admin') {
    return res.status(403).json({
      extra: 'manager role',
      message: 'You are not authorized to access this route',
    });
  }
  next();
};
