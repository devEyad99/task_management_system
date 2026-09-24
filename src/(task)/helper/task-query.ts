import { AppError } from '../../errors/AppError';
import {
  parsePagination,
  rejectUnknownFields,
  requireDate,
  requireObject,
  requirePositiveInteger,
  requireString,
  requireTaskStatus,
} from '../../helper/validation';
import {
  SortOrder,
  TASK_SORT_FIELDS,
  TaskQueryDto,
  TaskSortField,
} from '../dto';

const TASK_QUERY_FIELDS = [
  'page',
  'limit',
  'title',
  'search',
  'status',
  'assignee',
  'assigned_to',
  'deadlineFrom',
  'deadlineTo',
  'overdue',
  'sortBy',
  'sortOrder',
] as const;

function parseOptionalBoolean(value: unknown, field: string): boolean | undefined {
  if (value === undefined) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new AppError(400, `${field} must be true or false`);
}

function parseSortField(value: unknown): TaskSortField {
  if (value === undefined) return 'createdAt';
  if (
    typeof value !== 'string' ||
    !TASK_SORT_FIELDS.includes(value as TaskSortField)
  ) {
    throw new AppError(
      400,
      `sortBy must be one of: ${TASK_SORT_FIELDS.join(', ')}`
    );
  }
  return value as TaskSortField;
}

function parseSortOrder(value: unknown): SortOrder {
  if (value === undefined) return 'DESC';
  if (typeof value !== 'string') {
    throw new AppError(400, 'sortOrder must be asc or desc');
  }
  const normalized = value.toUpperCase();
  if (normalized !== 'ASC' && normalized !== 'DESC') {
    throw new AppError(400, 'sortOrder must be asc or desc');
  }
  return normalized;
}

export function parseTaskQuery(
  input: unknown,
  overdueAt: Date = new Date()
): TaskQueryDto {
  const query = requireObject(input);
  rejectUnknownFields(query, TASK_QUERY_FIELDS);
  if (query.assignee !== undefined && query.assigned_to !== undefined) {
    throw new AppError(400, 'Use either assignee or assigned_to, not both');
  }

  const { page, limit, offset } = parsePagination(query.page, query.limit);
  const deadlineFrom =
    query.deadlineFrom === undefined
      ? undefined
      : requireDate(query.deadlineFrom, 'deadlineFrom');
  const deadlineTo =
    query.deadlineTo === undefined
      ? undefined
      : requireDate(query.deadlineTo, 'deadlineTo');
  if (deadlineFrom && deadlineTo && deadlineFrom > deadlineTo) {
    throw new AppError(400, 'deadlineFrom must not be after deadlineTo');
  }

  const assigneeValue = query.assignee ?? query.assigned_to;
  return {
    page,
    limit,
    offset,
    overdueAt,
    sortBy: parseSortField(query.sortBy),
    sortOrder: parseSortOrder(query.sortOrder),
    ...(query.title === undefined
      ? {}
      : { title: requireString(query.title, 'title', { max: 200 }) }),
    ...(query.search === undefined
      ? {}
      : { search: requireString(query.search, 'search', { max: 200 }) }),
    ...(query.status === undefined
      ? {}
      : { status: requireTaskStatus(query.status) }),
    ...(assigneeValue === undefined
      ? {}
      : {
          assignedTo: requirePositiveInteger(assigneeValue, 'assignee'),
        }),
    ...(deadlineFrom === undefined ? {} : { deadlineFrom }),
    ...(deadlineTo === undefined ? {} : { deadlineTo }),
    ...(query.overdue === undefined
      ? {}
      : { overdue: parseOptionalBoolean(query.overdue, 'overdue') }),
  };
}
