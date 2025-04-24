import { Request, Response } from 'express';
import { UserService } from './user.service';
import { Task } from '../models';

export class UserController {
  constructor(private userService: UserService) {}

  getAllUsers = async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const page = parseInt(req.query.page as string) || 1;
      const name = req.query.name as string;
      const result = await this.userService.getAllUsers(limit, page, name);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: (error as any).message });
    }
  };

  getUserById = async (req: Request, res: Response) => {
    try {
      const user = await this.userService.getUserById(Number(req.params.id));
      res.status(200).json(user);
    } catch (error) {
      res.status(404).json({ message: (error as any).message });
    }
  };

  getMe = async (req: Request, res: Response) => {
    try {
      const tasks = await Task.findAll({ where: { assigned_to: req.currentUser?.id } });
      const result = await this.userService.getMe(req.currentUser, tasks);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: (error as any).message });
    }
  };

  deleteUserById = async (req: Request, res: Response) => {
    try {
      const result = await this.userService.deleteUserById(Number(req.params.id));
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({ message: (error as any).message });
    }
  };

  updateUser = async (req: Request, res: Response) => {
    try {
      const updatedUser = await this.userService.updateUser(Number(req.params.id), req.body);
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: (error as any).message });
    }
  };

  uploadProfileImage = async (req: Request, res: Response) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

      const user = await this.userService.uploadProfileImage(req.currentUser?.id || 0, req.file.filename);

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
      res.status(500).json({ message: (error as any).message });
    }
  };
}