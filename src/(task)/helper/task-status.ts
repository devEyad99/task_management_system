import Task, { TaskStatus } from '../../models/task.model';

type TaskStatusFields = Pick<Task, 'status' | 'completedAt'>;

export function applyTaskStatusTransition(
  task: TaskStatusFields,
  status: TaskStatus,
  completedAt: Date = new Date()
): void {
  if (task.status !== 'completed' && status === 'completed') {
    task.completedAt = completedAt;
  } else if (task.status === 'completed' && status !== 'completed') {
    task.completedAt = null;
  }

  task.status = status;
}
