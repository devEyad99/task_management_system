import { Router } from 'express';
import authRoutes from '../(auth)/auth.routes';
import taskRoutes from '../(task)/task.router';

const router = Router();

router.use('/auth', authRoutes);
router.use('/task', taskRoutes);

export default router;
