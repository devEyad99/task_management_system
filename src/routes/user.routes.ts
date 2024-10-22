//
import { UserController } from '../controllers/user.controller';
import { AppRouter } from '../AppRouter';

const router = AppRouter.getInstance();

const userController = new UserController();

router.post('/signup', (req, res, next) => {
  userController.signup(req, res);
});
router.get('/getAllUsers', (req, res, next) => {
  userController.getAllUsers(req, res);
});

export default router;
