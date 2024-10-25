//
import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Task, User } from '../models';

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
      // retrun the user , that task assigned to him with the response
      const user = await User.findOne({ where: { id: assigned_to } });

      return res.status(201).json({
        task,
        user: {
          id: user?.id,
          name: user?.name,
        },
      });
    } catch (error) {
      return res.status(400).json({ message: 'Invalid request' });
    }
  }
  async getAllTasks(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 5; // Corrected typo from 'limti' to 'limit'
      const page = parseInt(req.query.page as string) || 1;
      const offset = (page - 1) * limit;
      const title = req.query.title as string;
      const whereClause = title ? { title: { [Op.like]: `%${title}%` } } : {};

      const tasks = await Task.findAll({
        where: whereClause,
        limit: limit,
        offset: offset,
      });

      return res.status(200).json(tasks);
    } catch (error) {
      console.error(error); // Log the error for debugging purposes
      return res.status(400).json({ message: 'Invalid request' });
    }
  }
  async getTaskById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const task = await Task.findByPk(id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      return res.status(200).json(task);
    } catch (error) {
      console.error(error); // Log the error for debugging purposes
      return res.status(400).json({ message: 'Invalid request' });
    }
  }
  async deleteTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const task = await Task.findByPk(id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      await task.destroy();
      return res.status(204).end();
    } catch (error) {
      console.error(error); // Log the error for debugging purposes
      return res.status(400).json({ message: 'Invalid request' });
    }
  }
}
