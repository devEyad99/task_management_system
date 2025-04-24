import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { CreateUserDto } from './dto/createUser.dto';
import { UserLoginDto } from './dto/userLogin.dto';

export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}
  signup = async (req: Request, res: Response) => {
    try {
      const data = req.body as CreateUserDto;
      const result = await this.authService.signup(data);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ message: (err as any).message });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const data = req.body as UserLoginDto;
      const result = await this.authService.login(data);
      res.status(200).json(result);
    } catch (err) {
      res.status(401).json({ message: (err as any).message });
    }
  };
 
   refreshToken = async(req: Request, res: Response) => {
    try{
      const { refreshToken } = req.body;
        const data = await this.authService.refreshToken(refreshToken);
        return res.status(200).json(data);
    } catch(err) {
        return res.status(401).json({ message: (err as any).message });
    }  
  }
}
