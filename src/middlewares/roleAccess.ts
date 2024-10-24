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
    return res
      .status(403)
      .json({ message: 'You are not authorized to access this route' });
  }
  next();
};

export const adminAndManagerRole = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const role = req.currentUser?.role;
  if (role !== 'admin' && role !== 'manager') {
    return res.status(403).json({
      message: 'You are not authorized to access this route',
    });
  }
  next();
};
