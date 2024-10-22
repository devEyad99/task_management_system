//
import { Request, Response } from 'express';

import { Task } from '../models';

export class TaskController {
  async createTask(req: Request, res: Response) {
    try {
      const { title, description, status, deadline, assigned_to } = req.body;
      const task = await Task.create({
        title,
        description,
        status,
        deadline,
        assigned_to,
      });
      return res.status(201).json(task);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid request' });
    }
  }
  async getAllTasks(req: Request, res: Response) {
    try {
      const tasks = await Task.findAll();
      return res.status(200).json(tasks);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid request' });
    }
  }
}
