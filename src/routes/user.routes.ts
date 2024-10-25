//
import { UserController } from '../controllers/user.controller';
import { AppRouter } from '../AppRouter';
import { authenticate } from '../middlewares/authenticate';
import { adminRole, managerRole } from '../middlewares/roleAccess';

const router = AppRouter.getInstance();

const userController = new UserController();

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
router.get(
  '/getUser/:id',
  authenticate,
  (req, res, next) => {
    managerRole(req, res, next);
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

router.patch('/updateStatus/:id', authenticate, (req, res, next) => {
  userController.updateTaskStatus(req, res);
});
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
