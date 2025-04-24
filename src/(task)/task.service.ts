import { TaskRepository } from './helper/task.repository';
import { CreateTaskResponseDto, DeleteTaskByIdResponseDto } from './dto';


export class TaskService {
  constructor(private taskRepo: TaskRepository) {}

  async createTask(taskData: any) {
    const user = await this.taskRepo.findUserById(taskData.assigned_to);
    if (!user) throw new Error('User not found');

    const task = await this.taskRepo.createTask(taskData);

    const responseDto = CreateTaskResponseDto.factory(task, user);
    responseDto.user = { id: user.id, name: user.name };

    return responseDto;
  }

  async getAllTasks(query: any) {
    const limit = parseInt(query.limit) || 5;
    const page = parseInt(query.page) || 1;
    const offset = (page - 1) * limit;
    const title = query.title;

    const totalTasks = await this.taskRepo.countTasksByTitle(title);
    const tasks = await this.taskRepo.findTasks(title, limit, offset);
    const totalPages = Math.ceil(totalTasks / limit);

    return {
      totalPages,
      totalTasks,
      result: tasks.length,
      tasks,
    };
  }

  async getTaskById(id: string) {
    const task = await this.taskRepo.findTaskById(id);
    if (!task) throw new Error('Task not found');
    return task;
  }

  async deleteTask(id: string) {
    await this.getTaskById(id);
    await this.taskRepo.deleteTask(id);
    return DeleteTaskByIdResponseDto.fromTaskId();
  }
}
