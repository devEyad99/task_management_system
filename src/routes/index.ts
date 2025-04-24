import { Router } from 'express';
import authRoutes from '../(auth)/auth.routes';
import taskRoutes from '../(task)/task.router';
import userRouter from '../(user)/user.router';

const router = Router();

router.use('/auth', authRoutes);
router.use('/task', taskRoutes);
router.use('/user', userRouter);

export default router;
