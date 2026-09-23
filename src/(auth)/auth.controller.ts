import { AuthService } from './auth.service';
import { NextFunction, Request, Response } from 'express';

export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}
  signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.signup(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.login(req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await this.authService.refreshToken(req.body);
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  };
}
