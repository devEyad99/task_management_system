//
import { Response, NextFunction, Request } from 'express';

export const adminRole = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const role = req.currentUser?.role;

  if (role !== 'admin') {
    res
      .status(403)
      .json({ message: 'You are not authorized to access this route' });
    return;
  }
  next();
};

export const managerAndAdminRole = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const role = req.currentUser?.role;
  if (role !== 'manager' && role !== 'admin') {
    res
      .status(403)
      .json({ message: 'You are not authorized to access this route' });
    return;
  }
  next();
};
