import { Router } from 'express';
import { AuthRepository } from './helper/auth.respository';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

const router = Router();

const repo = new AuthRepository();
const service = new AuthService(repo);
const controller = new AuthController(service);

router.post('/signup', controller.signup);
router.post('/login', controller.login);

export default router;
