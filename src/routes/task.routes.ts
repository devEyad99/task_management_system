//
import { TaskController } from '../controllers/task.controller';
import { AppRouter } from '../AppRouter';

const router = AppRouter.getInstance();

const taskController = new TaskController();

router.post('/createTask', (req, res, next) => {
  taskController.createTask(req, res);
});
router.get('/getAllTasks', (req, res, next) => {
  taskController.getAllTasks(req, res);
});

export default router;
