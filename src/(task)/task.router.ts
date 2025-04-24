import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { managerAndAdminRole } from '../middlewares/roleAccess';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TaskRepository } from './helper/task.repository';

const router = Router();

// Setup dependencies
const taskRepo = new TaskRepository();
const taskService = new TaskService(taskRepo);
const taskController = new TaskController(taskService);

// Routes with middleware
router.post('/createTask', authenticate, managerAndAdminRole, taskController.createTask);
router.get('/getAllTasks', authenticate, managerAndAdminRole, taskController.getAllTasks);
router.get('/getTask/:id', authenticate, managerAndAdminRole, taskController.getTaskById);
router.delete('/deleteTask/:id', authenticate, managerAndAdminRole, taskController.deleteTask);

export default router;
