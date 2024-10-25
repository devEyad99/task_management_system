//
import { TaskController } from '../task/controller/task.controller';
import { AppRouter } from '../AppRouter';
import { authenticate } from '../middlewares/authenticate';
import { adminRole, managerAndAdminRole } from '../middlewares/roleAccess';

const router = AppRouter.getInstance();

const taskController = new TaskController();

// create task (for admin and manager)
router.post(
  '/createTask',
  authenticate,
  (req, res, next) => {
    managerAndAdminRole(req, res, next);
  },
  (req, res, next) => {
    taskController.createTask(req, res);
  }
);

// get all tasks (admin and manager)
router.get(
  '/getAllTasks',
  authenticate,
  (req, res, next) => {
    managerAndAdminRole(req, res, next);
  },
  (req, res, next) => {
    taskController.getAllTasks(req, res);
  }
);
// get task by user (admin and manager)
router.get(
  '/getTask/:id',
  authenticate,
  (req, res, next) => {
    managerAndAdminRole(req, res, next);
  },
  (req, res, next) => {
    taskController.getTaskById(req, res);
  }
);
// delete task (admin and manager)
router.delete(
  '/deleteTask/:id',
  authenticate,
  (req, res, next) => {
    managerAndAdminRole(req, res, next);
  },
  (req, res, next) => {
    taskController.deleteTask(req, res);
  }
);

export default router;
