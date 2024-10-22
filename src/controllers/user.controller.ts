import { Request, Response } from 'express';
import { Task, User } from '../models';
import bcrypt from 'bcrypt';
import _ from 'lodash';
import validator from 'validator';
import {
  getAccessToken,
  getRefreshToken,
  verifyRefreshToken,
} from '../utiles/jwt';
import { RequestWithUser } from '../interfaces/RequestWithUser';

export class UserController {
  async signup(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
      });

      const newUser = _.omit(user.toJSON(), 'password');
      const token = getAccessToken({ email, role, id: user.id });

      return res.status(201).json({
        message: 'User created successfully',
        token,
        user: newUser,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: 'Email and password are required' });
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const loggedUser = _.omit(user.toJSON(), 'password');
      const token = getAccessToken({ email, role: user.role, id: user.id });
      const refreshToken = getRefreshToken({
        email: user.email,
        role: user.role,
        id: user.id,
      });

      return res.status(200).json({
        message: 'Login successful',
        token,
        refreshToken,
        user: loggedUser,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

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
  refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    try {
      const currentUser = verifyRefreshToken(refreshToken);

      const accessToken = getAccessToken({
        email: currentUser.email,
        role: currentUser.role,
        id: currentUser.id,
      });

      const newRefreshToken = getRefreshToken({
        email: currentUser.email,
        role: currentUser.role,
        id: currentUser.id,
      });

      return res.json({
        message: 'Refresh token generated successfully',
        access_token: accessToken,
        refresh_token: newRefreshToken,
      });
    } catch (error) {
      console.error('Token verification failed:', error);
      return res
        .status(403)
        .json({ message: 'Invalid token. Please log in again.' });
    }
  }
}
