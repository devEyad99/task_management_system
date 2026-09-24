import { NextFunction, Request, Response } from 'express';
import { TaskService } from './task.service';
import { AppError } from '../errors/AppError';

export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  createTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.currentUser) throw new AppError(401, 'Authentication required');
      const result = await this.taskService.createTask(req.currentUser, req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  updateTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.currentUser) throw new AppError(401, 'Authentication required');
      const result = await this.taskService.updateTask(
        req.currentUser,
        req.params.id,
        req.body
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  getAllTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.taskService.getAllTasks(req.query);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  getTaskById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.currentUser) throw new AppError(401, 'Authentication required');
      const result = await this.taskService.getTaskById(
        req.currentUser,
        req.params.id
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  deleteTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.taskService.deleteTask(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
