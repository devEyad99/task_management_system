import { NextFunction, Request, Response } from 'express';
import { TaskService } from './task.service';

export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  createTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.taskService.createTask(req.body);
      res.status(201).json(result);
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
      const result = await this.taskService.getTaskById(req.params.id);
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
