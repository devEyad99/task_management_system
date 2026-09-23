import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { adminRole, managerAndAdminRole } from '../middlewares/roleAccess';
import upload from '../utiles/upload';
import { UserRepository } from './helper/user.respository';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TaskRepository } from '../(task)/helper/task.repository';

const router = Router();
const userRepo = new UserRepository();
const taskRepo = new TaskRepository();
const userService = new UserService(userRepo, taskRepo);
const userController = new UserController(userService);

router.get('/getAllUsers', authenticate, adminRole, userController.getAllUsers);
router.get(
  '/getUserById/:id',
  authenticate,
  managerAndAdminRole,
  userController.getUserById
);
router.get('/getMe', authenticate, userController.getMe);
router.delete(
  '/deleteUser/:id',
  authenticate,
  adminRole,
  userController.deleteUserById
);
router.patch(
  '/updateUser/:id',
  authenticate,
  adminRole,
  userController.updateUser
);
router.get('/my-tasks', authenticate, userController.getMyTasks);
router.patch('/updateStatus/:id', authenticate, userController.updateTaskStatus);
router.post(
  '/profile/upload',
  authenticate,
  upload.single('profile_image'),
  userController.uploadProfileImage
);

export default router;
