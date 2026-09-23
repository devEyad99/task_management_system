import { TaskStatus } from '../../models/task.model';

export interface CreateTaskDto {
  title: string;
  description: string;
  status: TaskStatus;
  deadline: Date;
  assigned_to: number;
}
