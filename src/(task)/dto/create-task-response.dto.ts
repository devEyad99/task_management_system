// //
import { Task } from '../../models';

export class CreateTaskResponseDto {
  task?: {
    id: number;
    title: string;
    description: string;
    status: string;
    deadline: Date;
    assigned_to: number;
  };
  user?: {
    id: number;
    name: string;
  };
  message?: string;
  status?: string;

  static factory(
    task: Task,
    user: { id: number; name: string }
  ): CreateTaskResponseDto {
    const result = new CreateTaskResponseDto();

    result.task = {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      deadline: task.deadline,
      assigned_to: task.assigned_to,
    };
    result.user = user;
    result.message = 'Task created';
    result.status = 'OK';

    return result;
  }
}
