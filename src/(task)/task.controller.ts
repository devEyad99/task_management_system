import { Request, Response } from 'express';
import { TaskService } from './task.service';

export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  createTask = async (req: Request, res: Response) => {
    try {
      const result = await this.taskService.createTask(req.body);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  getAllTasks = async (req: Request, res: Response) => {
    try {
      const { limit, page, title } = req.query;
      const result = await this.taskService.getAllTasks({
        limit: Number(limit),
        page: Number(page),
        title: title as string,
      });
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  getTaskById = async (req: Request, res: Response) => {
    try {
      const result = await this.taskService.getTaskById(req.params.id);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(404).json({ message: err.message });
    }
  };

  deleteTask = async (req: Request, res: Response) => {
    try {
      const result = await this.taskService.deleteTask(req.params.id);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(404).json({ message: err.message });
    }
  };
}
