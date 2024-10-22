//
import { NextFunction, Request, Response } from 'express';
import { User } from '../models';
import bcrypt from 'bcrypt';

export class UserController {
  async signup(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;
      const hashedPassworrd = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email,
        password: hashedPassworrd,
        role,
      });
      return res.status(201).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await User.findAll();
      return res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
