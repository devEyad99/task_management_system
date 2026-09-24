import { TaskRepository } from './helper/task.repository';
import {
  CreateTaskDto,
  CreateTaskResponseDto,
  DeleteTaskByIdResponseDto,
} from './dto';
import { AppError } from '../errors/AppError';
import {
  rejectUnknownFields,
  requireDate,
  requireObject,
  requirePositiveInteger,
  requireString,
  requireTaskStatus,
} from '../helper/validation';
import { ICurrentUser } from '../interfaces/ICurrentUser';
import { applyTaskStatusTransition } from './helper/task-status';
import { parseTaskQuery } from './helper/task-query';

export class TaskService {
  constructor(private taskRepo: TaskRepository) {}

  async createTask(currentUser: ICurrentUser, input: unknown) {
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
      createdBy: currentUser.id,
      completedAt: null,
    };
    if (taskData.status === 'completed') {
      taskData.completedAt = new Date();
    }
    const user = await this.taskRepo.findUserById(taskData.assigned_to);
    if (!user) throw new AppError(404, 'User not found');

    const task = await this.taskRepo.createTask(taskData);

    const responseDto = CreateTaskResponseDto.factory(task, user);
    responseDto.user = { id: user.id, name: user.name };

    return responseDto;
  }

  async updateTask(
    currentUser: ICurrentUser,
    idValue: unknown,
    input: unknown
  ) {
    if (currentUser.role !== 'manager' && currentUser.role !== 'admin') {
      throw new AppError(403, 'You are not allowed to update this task');
    }

    const id = requirePositiveInteger(idValue, 'id');
    const data = requireObject(input);
    rejectUnknownFields(data, [
      'title',
      'description',
      'status',
      'deadline',
      'assigned_to',
    ]);
    if (Object.keys(data).length === 0) {
      throw new AppError(400, 'At least one field must be provided');
    }

    const task = await this.taskRepo.findTaskById(id);
    if (!task) throw new AppError(404, 'Task not found');

    if (data.title !== undefined) {
      task.title = requireString(data.title, 'title', { max: 200 });
    }
    if (data.description !== undefined) {
      task.description = requireString(data.description, 'description', {
        max: 5000,
      });
    }
    if (data.deadline !== undefined) {
      task.deadline = requireDate(data.deadline, 'deadline');
    }
    if (data.assigned_to !== undefined) {
      const assigneeId = requirePositiveInteger(data.assigned_to, 'assigned_to');
      const assignee = await this.taskRepo.findUserById(assigneeId);
      if (!assignee) throw new AppError(404, 'User not found');
      task.assigned_to = assigneeId;
    }
    if (data.status !== undefined) {
      applyTaskStatusTransition(task, requireTaskStatus(data.status));
    }

    return this.taskRepo.saveTask(task);
  }

  async getAllTasks(query: Record<string, unknown>) {
    const taskQuery = parseTaskQuery(query);

    const [totalTasks, tasks] = await Promise.all([
      this.taskRepo.countTasks(taskQuery),
      this.taskRepo.findTasks(taskQuery),
    ]);
    const totalPages = Math.ceil(totalTasks / taskQuery.limit);

    return {
      page: taskQuery.page,
      limit: taskQuery.limit,
      totalPages,
      totalTasks,
      result: tasks.length,
      tasks,
    };
  }

  async getTaskById(currentUser: ICurrentUser, idValue: unknown) {
    const id = requirePositiveInteger(idValue, 'id');
    const task = await this.taskRepo.findTaskById(id);
    if (!task) throw new AppError(404, 'Task not found');
    if (
      currentUser.role === 'employee' &&
      task.assigned_to !== currentUser.id
    ) {
      throw new AppError(403, 'You are not allowed to access this task');
    }
    return task;
  }

  async deleteTask(idValue: unknown) {
    const id = requirePositiveInteger(idValue, 'id');
    const task = await this.taskRepo.findTaskById(id);
    if (!task) throw new AppError(404, 'Task not found');
    await this.taskRepo.deleteTask(id);
    return DeleteTaskByIdResponseDto.fromTaskId();
  }
}
