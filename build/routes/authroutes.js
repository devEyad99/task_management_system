"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//
const AppRouter_1 = require("../AppRouter");
const auth_controller_1 = require("../controllers/auth.controller");
const router = AppRouter_1.AppRouter.getInstance();
const authController = new auth_controller_1.AuthController();
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
exports.default = router;
