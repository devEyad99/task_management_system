//
import { UserController } from '../user/controller/user.controller';
import { AppRouter } from '../AppRouter';
import { authenticate } from '../middlewares/authenticate';
import { adminRole, managerAndAdminRole } from '../middlewares/roleAccess';

const router = AppRouter.getInstance();

const userController = new UserController();

// create user (only accessable by admin)
router.get(
  '/getAllUsers',
  authenticate,
  (req, res, next) => {
    adminRole(req, res, next);
  },
  (req, res, next) => {
    userController.getAllUsers(req, res);
  }
);
//
// get user by id (only accessable by admin and manager)
router.get(
  '/getUser/:id',
  authenticate,
  (req, res, next) => {
    managerAndAdminRole(req, res, next);
  },
  (req, res, next) => {
    userController.getUserById(req, res);
  }
);

// route for user profile
router.get('/getMe', authenticate, (req, res, next) => {
  userController.getMe(req, res);
});

// route for user tasks only
router.get('/my-tasks', authenticate, (req, res) => {
  userController.getLoggedInUserTasks(req, res);
});

// delete user (onlu accessable by admin)
router.delete(
  '/deleteUser/:id',
  authenticate,
  (req, res, next) => {
    adminRole(req, res, next);
  },
  (req, res, next) => {
    userController.deleteUserById(req, res);
  }
);

// update task status (for user that owned task)
router.patch('/updateStatus/:id', authenticate, (req, res, next) => {
  userController.updateTaskStatus(req, res);
});
// update user (only accessable by admin)
router.patch(
  '/updateUser/:id',
  authenticate,
  (req, res, next) => {
    adminRole(req, res, next);
  },
  (req, res, next) => {
    userController.updateUser(req, res);
  }
);

export default router;
