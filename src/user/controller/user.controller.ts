import { Request, Response } from 'express';
import { Task, User } from '../../models';
import _ from 'lodash';
import { Op } from 'sequelize';
import {
  controller,
  get,
  use,
  del,
  patch,
  bodyValidator,
  post,
} from '../../decorators';
import { authenticate } from '../../middlewares/authenticate';
import { adminRole, managerAndAdminRole } from '../../middlewares/roleAccess';
import upload from '../../utiles/upload';

@controller('/user')
export class UserController {
  @use(adminRole)
  @use(authenticate)
  @get('/getAllUsers')
  async getAllUsers(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const page = parseInt(req.query.page as string) || 1;
      const offset = (page - 1) * limit || 0;
      const name = req.query.name as string;
      const whereClause = name ? { name: { [Op.like]: `%${name}%` } } : {};
      const users = await User.findAll({
        where: whereClause,
        limit: limit,
        offset: offset,
      });

      const totalUsers = await User.count({ where: whereClause });
      console.log(totalUsers);
      if (totalUsers === 0) {
        return res.status(401).json({ message: 'No users found' });
      }

      const totalPages = Math.ceil(totalUsers / limit);

      const allUsers = users.map((user) => _.omit(user.toJSON(), 'password'));
      return res.status(200).json({
        totalUsers,
        totalPages,
        results: users.length,
        allUsers,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @use(managerAndAdminRole)
  @use(authenticate)
  @get('/getUserById/:id')
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

  @use(authenticate)
  @get('/getMe')
  async getMe(req: Request, res: Response) {
    // find all tasks assigned to that user
    try {
      const tasks = await Task.findAll({
        where: { assigned_to: req.currentUser?.id },
      });
      // console.log(req.currentUser);
      const user = req.currentUser;
      return res.status(200).json({
        user,
        tasks,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @use(adminRole)
  @use(authenticate)
  @del('/deleteUser/:id')
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

  @use(authenticate)
  @get('/my-tasks')
  async getMyTasks(req: Request, res: Response) {
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

  @bodyValidator('status')
  @use(authenticate)
  @patch('/updateStatus/:id')
  async updateTaskStatus(req: Request, res: Response) {
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

  @use(adminRole)
  @use(authenticate)
  @patch('/updateUser/:id')
  async updateUser(req: Request, res: Response) {
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
  // upload user profile image
  @use(authenticate)
  @use(upload.single('profile_image'))
  @post('/profile/upload')
  async uploadProfileImage(req: Request, res: Response) {
    try {
      const id = req.currentUser?.id;
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (req.file) {
        // Save the relative path for the uploaded image
        // user.profile_image = `/uploads/${req.file.filename}`;
        user.profile_image = `/uploads/${encodeURIComponent(
          req.file.filename
        )}`;
        await user.save();

        return res.status(200).json({
          message: 'Profile image updated successfully',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            profile_image: user.profile_image, // Relative path
          },
        });
      }

      return res.status(400).json({ message: 'Bad request, no file uploaded' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
