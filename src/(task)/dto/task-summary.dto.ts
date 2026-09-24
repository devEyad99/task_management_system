import { TaskPriority } from '../../models/task.model';

export interface TaskSummaryDto {
  total: number;
  pending: number;
  'in-progress': number;
  completed: number;
  overdue: number;
  priority: Record<TaskPriority, number>;
}
