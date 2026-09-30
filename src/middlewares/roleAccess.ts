//
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { UserRole } from '../models/user.model';
import { AppError } from '../errors/AppError';

function requireRoles(...allowedRoles: UserRole[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.currentUser || !allowedRoles.includes(req.currentUser.role)) {
      next(new AppError(403, 'You are not authorized to access this route'));
      return;
    }
    next();
  };
}

export const adminRole = requireRoles('admin');
export const managerAndAdminRole = requireRoles('manager', 'admin');
