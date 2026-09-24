import { TaskStatus } from '../../models/task.model';

export const TASK_SORT_FIELDS = [
  'createdAt',
  'updatedAt',
  'deadline',
  'title',
] as const;
export type TaskSortField = (typeof TASK_SORT_FIELDS)[number];
export type SortOrder = 'ASC' | 'DESC';

export interface TaskQueryDto {
  title?: string;
  search?: string;
  status?: TaskStatus;
  assignedTo?: number;
  deadlineFrom?: Date;
  deadlineTo?: Date;
  overdue?: boolean;
  overdueAt: Date;
  sortBy: TaskSortField;
  sortOrder: SortOrder;
  page: number;
  limit: number;
  offset: number;
}
