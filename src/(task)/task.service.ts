import { TaskRepository } from './helper/task.repository';
import {
  CreateTaskDto,
  CreateTaskResponseDto,
  DeleteTaskByIdResponseDto,
} from './dto';
import { AppError } from '../errors/AppError';
import {
  parsePagination,
  rejectUnknownFields,
  requireDate,
  requireObject,
  requirePositiveInteger,
  requireString,
  requireTaskStatus,
} from '../helper/validation';

export class TaskService {
  constructor(private taskRepo: TaskRepository) {}

  async createTask(input: unknown) {
    const data = requireObject(input);
    rejectUnknownFields(data, [
      'title',
      'description',
      'status',
      'deadline',
      'assigned_to',
    ]);
    const taskData: CreateTaskDto = {
      title: requireString(data.title, 'title', { max: 200 }),
      description: requireString(data.description, 'description', { max: 5000 }),
      status: requireTaskStatus(data.status),
      deadline: requireDate(data.deadline, 'deadline'),
      assigned_to: requirePositiveInteger(data.assigned_to, 'assigned_to'),
    };
    const user = await this.taskRepo.findUserById(taskData.assigned_to);
    if (!user) throw new AppError(404, 'User not found');

    const task = await this.taskRepo.createTask(taskData);

    const responseDto = CreateTaskResponseDto.factory(task, user);
    responseDto.user = { id: user.id, name: user.name };

    return responseDto;
  }

  async getAllTasks(query: Record<string, unknown>) {
    const { limit, offset } = parsePagination(query.page, query.limit);
    const title =
      query.title === undefined
        ? undefined
        : requireString(query.title, 'title', { max: 200 });

    const [totalTasks, tasks] = await Promise.all([
      this.taskRepo.countTasksByTitle(title),
      this.taskRepo.findTasks(title, limit, offset),
    ]);
    const totalPages = Math.ceil(totalTasks / limit);

    return {
      totalPages,
      totalTasks,
      result: tasks.length,
      tasks,
    };
  }

  async getTaskById(idValue: unknown) {
    const id = requirePositiveInteger(idValue, 'id');
    const task = await this.taskRepo.findTaskById(id);
    if (!task) throw new AppError(404, 'Task not found');
    return task;
  }

  async deleteTask(idValue: unknown) {
    const id = requirePositiveInteger(idValue, 'id');
    await this.getTaskById(id);
    await this.taskRepo.deleteTask(id);
    return DeleteTaskByIdResponseDto.fromTaskId();
  }
}
