//
import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Task, User } from '../../models';
import { CreateTaskResponseDto, DeleteTaskByIdResponseDto } from '../dtos';
import { controller, del, get, post, use } from '../../decorators';
import { managerAndAdminRole } from '../../middlewares/roleAccess';
import { authenticate } from '../../middlewares/authenticate';

@controller('/task')
export class TaskController {
  @use(managerAndAdminRole)
  @use(authenticate)
  @post('/createTask')
  async createTask(req: Request, res: Response) {
    try {
      const task = req.body;
      const user = await User.findOne({ where: { id: req.body.assigned_to } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      await Task.create(task);

      const responseDto = CreateTaskResponseDto.factory(task, user);
      const userInfo = {
        id: user.id,
        name: user.name,
      };
      responseDto.user = userInfo;
      return res.status(201).json(responseDto);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: 'Invalid request' });
    }
  }

  @use(managerAndAdminRole)
  @use(authenticate)
  @get('/getAllTasks')
  async getAllTasks(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const page = parseInt(req.query.page as string) || 1;
      const offset = (page - 1) * limit;
      const title = req.query.title as string;
      const whereClause = title ? { title: { [Op.like]: `%${title}%` } } : {};

      const tasks = await Task.findAll({
        where: whereClause,
        limit: limit,
        offset: offset,
      });

      return res.status(200).json({
        result: tasks.length,
        tasks,
      });
    } catch (error) {
      console.error(error); // Log the error for debugging purposes
      return res.status(400).json({ message: 'Invalid request' });
    }
  }

  @use(managerAndAdminRole)
  @use(authenticate)
  @get('/getTask/:id')
  async getTaskById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const task = await Task.findByPk(id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      return res.status(200).json(task);
    } catch (error) {
      console.error(error); // Log the error for debugging purposes
      return res.status(400).json({ message: 'Invalid request' });
    }
  }
  @use(managerAndAdminRole)
  @use(authenticate)
  @del('/deleteTask/:id')
  async deleteTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const task = await Task.findByPk(id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      await task.destroy();
      res.status(200).send(DeleteTaskByIdResponseDto.fromTaskId());
    } catch (error) {
      console.error(error); // Log the error for debugging purposes
      return res.status(400).json({ message: 'Invalid request' });
    }
  }
}
