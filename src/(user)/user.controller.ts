import { NextFunction, Request, Response } from 'express';
import { UserService } from './user.service';
import { AppError } from '../errors/AppError';

export class UserController {
  constructor(private userService: UserService) {}

  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.userService.getAllUsers(req.query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.getUserById(req.params.id);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.currentUser) throw new AppError(401, 'Authentication required');
      const result = await this.userService.getMe(req.currentUser);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.userService.deleteUserById(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedUser = await this.userService.updateUser(
        req.params.id,
        req.body
      );
      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  };

  uploadProfileImage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.file) throw new AppError(400, 'No file uploaded');
      if (!req.currentUser) throw new AppError(401, 'Authentication required');

      const user = await this.userService.uploadProfileImage(
        req.currentUser.id,
        req.file.filename
      );

      res.status(200).json({
        message: 'Profile image updated successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile_image: user.profile_image,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getMyTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.currentUser) throw new AppError(401, 'Authentication required');
      res.status(200).json(await this.userService.getMyTasks(req.currentUser));
    } catch (error) {
      next(error);
    }
  };

  updateTaskStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.currentUser) throw new AppError(401, 'Authentication required');
      const task = await this.userService.updateTaskStatus(
        req.currentUser,
        req.params.id,
        req.body
      );
      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  };
}
