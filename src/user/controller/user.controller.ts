import { NextFunction, Request, Response } from 'express';
import { Task, User } from '../../models';
import _ from 'lodash';
import { RequestWithUser } from '../../interfaces/RequestWithUser';
import { Op } from 'sequelize';
export class UserController {
  async getAllUsers(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 5; // Parse limit to ensure it's a number
      const page = parseInt(req.query.page as string) || 1; // Parse page to ensure it's a number
      const offset = (page - 1) * limit || 0;
      const name = req.query.name as string;
      const whereClause = name ? { name: { [Op.like]: `%${name}%` } } : {};
      const users = await User.findAll({
        where: whereClause,
        limit: limit,
        offset: offset,
      });
      const usersWithoutPassword = users.map((user) =>
        _.omit(user.toJSON(), 'password')
      );
      return res.status(200).json({
        results: users.length,
        page,
        usersWithoutPassword,
      });
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
  async deleteUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await User.findOne({ where: { id } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
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
        return res.status(403).json({
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
  async updateUser(req: RequestWithUser, res: Response) {
    try {
      const { id } = req.params;
      const { name, email, role } = req.body;
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (name !== undefined) {
        user.name = name;
      }
      if (email !== undefined) {
        user.email = email;
      }
      if (role !== undefined) {
        user.role = role;
      }
      await user.save();
      return res.status(200).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
