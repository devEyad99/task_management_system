import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { adminRole, managerAndAdminRole } from '../middlewares/roleAccess';
import upload from '../utiles/upload';
import { UserRepository } from './helper/user.respository';
import { UserService } from './user.service';
import { UserController } from './user.controller';

const router = Router();
const userRepo = new UserRepository();
const userService = new UserService(userRepo);
const userController = new UserController(userService);

router.get('/getAllUsers', authenticate, adminRole, userController.getAllUsers);
router.get('/getUserById/:id', authenticate, managerAndAdminRole, userController.getUserById);
router.get('/getMe', authenticate, userController.getMe);
router.delete('/deleteUser/:id', authenticate, adminRole, userController.deleteUserById);
router.patch('/updateUser/:id', authenticate, adminRole, userController.updateUser);
// router.post('/profile/upload', authenticate, upload.single('profile_image'), userController.uploadProfileImage);

export default router;
