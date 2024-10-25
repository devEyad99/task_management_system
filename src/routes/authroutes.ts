//
import { AppRouter } from '../AppRouter';
import { AuthController } from '../controllers/auth.controller';

const router = AppRouter.getInstance();
const authController = new AuthController();

// route for signup
router.post('/signup', (req, res, next) => {
  authController.signup(req, res);
});

// route for login
router.post('/login', (req, res, next) => {
  authController.login(req, res);
});

// rouet for refresh token
router.post('/refreshToken', (req, res, next) => {
  authController.refreshToken(req, res);
});

export default router;
