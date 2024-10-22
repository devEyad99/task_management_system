//
import { UserController } from '../controllers/user.controller';
import { AppRouter } from '../AppRouter';
import { authenticate } from '../middlewares/authenticate';

const router = AppRouter.getInstance();

const userController = new UserController();

router.post('/signup', (req, res, next) => {
  userController.signup(req, res);
});
router.get('/getAllUsers', (req, res, next) => {
  userController.getAllUsers(req, res);
});
router.get('/getUser/:id', (req, res, next) => {
  userController.getUser(req, res);
});
router.post('/login', (req, res, next) => {
  userController.login(req, res);
});

router.get('/currentUser', authenticate, (req, res, next) => {
  userController.currentUser(req, res);
});
// rouet for refresh token
router.post('/refreshToken', (req, res, next) => {
  userController.refreshToken(req, res);
});

export default router;
