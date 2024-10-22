//
import { UserController } from '../controllers/user.controller';
import { AppRouter } from '../AppRouter';
import { authenticate } from '../middlewares/authenticate';
import { adminRole } from '../middlewares/roleAccess';

const router = AppRouter.getInstance();

const userController = new UserController();

router.post('/signup', (req, res, next) => {
  userController.signup(req, res);
});

router.post('/login', (req, res, next) => {
  userController.login(req, res);
});

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
router.get('/getUser/:id', (req, res, next) => {
  userController.getUserById(req, res);
});

router.get('/getMe', authenticate, (req, res, next) => {
  userController.getMe(req, res);
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
// rouet for refresh token
router.post('/refreshToken', (req, res, next) => {
  userController.refreshToken(req, res);
});

export default router;
