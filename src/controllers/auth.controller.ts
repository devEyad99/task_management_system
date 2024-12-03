//
import { Request, Response } from 'express';
import { User } from '../models';
import bcrypt from 'bcrypt';
import _ from 'lodash';
import validator from 'validator';
import {
  getAccessToken,
  getRefreshToken,
  verifyRefreshToken,
} from '../utiles/jwt';
import { bodyValidator, controller, post } from '../decorators';

@controller('/auth')
export class AuthController {
  @post('/signup')
  @bodyValidator('name', 'email', 'password', 'role')
  async signup(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;

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

      const userWithoutPassword = _.omit(user.toJSON(), 'password');
      const token = getAccessToken({ email, role, id: user.id });

      return res.status(201).json({
        message: 'User created successfully',
        token,
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @post('/login')
  @bodyValidator('email', 'password')
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const userWithoutPassword = _.omit(user.toJSON(), 'password');
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
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @post('/refreshToken')
  @bodyValidator('refreshToken')
  refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
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
