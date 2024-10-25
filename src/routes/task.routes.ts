//
import { TaskController } from '../controllers/task.controller';
import { AppRouter } from '../AppRouter';
import { authenticate } from '../middlewares/authenticate';
import { adminRole, managerRole } from '../middlewares/roleAccess';

const router = AppRouter.getInstance();

const taskController = new TaskController();

// create task (admin and manager)
router.post(
  '/createTask',
  authenticate,
  (req, res, next) => {
    managerRole(req, res, next);
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
    adminRole(req, res, next);
  },
  (req, res, next) => {
    managerRole(req, res, next);
  },
  (req, res, next) => {
    taskController.getAllTasks(req, res);
  }
);
// get all tasks by user (admin and manager)
router.get(
  '/getTask/:id',
  authenticate,
  (req, res, next) => {
    managerRole(req, res, next);
  },
  (req, res, next) => {
    taskController.getTaskById(req, res);
  }
);
// update task (admin and manager)
router.delete(
  '/deleteTask/:id',
  authenticate,
  (req, res, next) => {
    managerRole(req, res, next);
  },
  (req, res, next) => {
    taskController.deleteTask(req, res);
  }
);

export default router;
