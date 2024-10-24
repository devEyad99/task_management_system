//
import { TaskController } from '../controllers/task.controller';
import { AppRouter } from '../AppRouter';
import { adminAndManagerRole } from '../middlewares/roleAccess';
import { authenticate } from '../middlewares/authenticate';

const router = AppRouter.getInstance();

const taskController = new TaskController();

router.post('/createTask', (req, res, next) => {
  taskController.createTask(req, res);
});
router.get(
  '/getAllTasks',
  authenticate,
  (req, res, next) => {
    adminAndManagerRole(req, res, next);
  },
  (req, res, next) => {
    taskController.getAllTasks(req, res);
  }
);

export default router;
