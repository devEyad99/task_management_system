import { Request, Response } from 'express';
import { Task, User } from '../models';
import _ from 'lodash';
import { RequestWithUser } from '../interfaces/RequestWithUser';

export class UserController {
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await User.findAll();
      const usersWithoutPassword = users.map((user) =>
        _.omit(user.toJSON(), 'password')
      );
      return res.status(200).json(usersWithoutPassword);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const userWithoutPassword = _.omit(user.toJSON(), 'password');
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async getMe(req: RequestWithUser, res: Response) {
    // find all task assigned to that user
    try {
      const tasks = await Task.findAll({
        where: { assigned_to: req.currentUser?.id },
      });

      return res.status(200).json({
        user: {
          id: req.currentUser?.id,
          name: req.currentUser?.name,
          email: req.currentUser?.email,
          role: req.currentUser?.role,
          tasks,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  deleteUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      User.destroy({ where: { id } });
      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async getLoggedInUserTasks(req: RequestWithUser, res: Response) {
    try {
      const userId = req.currentUser?.id;

      if (!userId) {
        return res.status(400).json({ message: 'User not found' });
      }
      const tasks = await Task.findAll({ where: { assigned_to: userId } });
      return res.status(200).json(tasks);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async updateTaskStatus(req: RequestWithUser, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const task = await Task.findByPk(id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      if (task?.assigned_to !== req.currentUser?.id) {
        return res
          .status(403)
          .json({
            message: 'Forbidden, you are not allowed to updata this task',
          });
      }
      task.status = status;
      await task.save();
      return res.status(200).json(task);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
