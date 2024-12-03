"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//
const user_controller_1 = require("../user/controller/user.controller");
const AppRouter_1 = require("../AppRouter");
const authenticate_1 = require("../middlewares/authenticate");
const roleAccess_1 = require("../middlewares/roleAccess");
const upload_1 = __importDefault(require("../utiles/upload"));
const router = AppRouter_1.AppRouter.getInstance();
const userController = new user_controller_1.UserController();
// create user (only accessable by admin)
router.get('/getAllUsers', authenticate_1.authenticate, (req, res, next) => {
    (0, roleAccess_1.adminRole)(req, res, next);
}, (req, res, next) => {
    userController.getAllUsers(req, res);
});
//
// get user by id (only accessable by admin and manager)
router.get('/getUser/:id', authenticate_1.authenticate, (req, res, next) => {
    (0, roleAccess_1.managerAndAdminRole)(req, res, next);
}, (req, res, next) => {
    userController.getUserById(req, res);
});
// route for user profile
router.get('/getMe', authenticate_1.authenticate, (req, res, next) => {
    userController.getMe(req, res);
});
// route for user tasks only
router.get('/my-tasks', authenticate_1.authenticate, (req, res) => {
    userController.getLoggedInUserTasks(req, res);
});
// delete user (onlu accessable by admin)
router.delete('/deleteUser/:id', authenticate_1.authenticate, (req, res, next) => {
    (0, roleAccess_1.adminRole)(req, res, next);
}, (req, res, next) => {
    userController.deleteUserById(req, res);
});
// update task status (for user that owned task)
router.patch('/updateStatus/:id', authenticate_1.authenticate, (req, res, next) => {
    userController.updateTaskStatus(req, res);
});
// update user (only accessable by admin)
router.patch('/updateUser/:id', authenticate_1.authenticate, (req, res, next) => {
    (0, roleAccess_1.adminRole)(req, res, next);
}, (req, res, next) => {
    userController.updateUser(req, res);
});
// route for upload user profile image that i implemented in user controller
router.post('/profile/upload', upload_1.default.single('profile_image'), authenticate_1.authenticate, (req, res) => {
    userController.uploadProfileImage(req, res);
});
exports.default = router;
