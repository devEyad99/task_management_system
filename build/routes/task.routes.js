"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//
const task_controller_1 = require("../task/controller/task.controller");
const AppRouter_1 = require("../AppRouter");
const authenticate_1 = require("../middlewares/authenticate");
const roleAccess_1 = require("../middlewares/roleAccess");
const router = AppRouter_1.AppRouter.getInstance();
const taskController = new task_controller_1.TaskController();
// create task (for admin and manager)
router.post('/createTask', authenticate_1.authenticate, (req, res, next) => {
    (0, roleAccess_1.managerAndAdminRole)(req, res, next);
}, (req, res, next) => {
    taskController.createTask(req, res);
});
// get all tasks (admin and manager)
router.get('/getAllTasks', authenticate_1.authenticate, (req, res, next) => {
    (0, roleAccess_1.managerAndAdminRole)(req, res, next);
}, (req, res, next) => {
    taskController.getAllTasks(req, res);
});
// get task by user (admin and manager)
router.get('/getTask/:id', authenticate_1.authenticate, (req, res, next) => {
    (0, roleAccess_1.managerAndAdminRole)(req, res, next);
}, (req, res, next) => {
    taskController.getTaskById(req, res);
});
// delete task (admin and manager)
router.delete('/deleteTask/:id', authenticate_1.authenticate, (req, res, next) => {
    (0, roleAccess_1.managerAndAdminRole)(req, res, next);
}, (req, res, next) => {
    taskController.deleteTask(req, res);
});
exports.default = router;
