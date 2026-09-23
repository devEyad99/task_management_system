import { AppError } from '../errors/AppError';
import { TASK_STATUSES, TaskStatus } from '../models/task.model';
import { USER_ROLES, UserRole } from '../models/user.model';

type UnknownRecord = Record<string, unknown>;

export function requireObject(value: unknown): UnknownRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new AppError(400, 'Request body must be an object');
  }
  return value as UnknownRecord;
}

export function rejectUnknownFields(
  value: UnknownRecord,
  allowedFields: readonly string[]
): void {
  const unknownFields = Object.keys(value).filter(
    (field) => !allowedFields.includes(field)
  );
  if (unknownFields.length > 0) {
    throw new AppError(400, `Unknown field(s): ${unknownFields.join(', ')}`);
  }
}

export function requireString(
  value: unknown,
  field: string,
  options: { min?: number; max?: number } = {}
): string {
  if (typeof value !== 'string') {
    throw new AppError(400, `${field} must be a string`);
  }
  const normalized = value.trim();
  const min = options.min ?? 1;
  if (normalized.length < min) {
    throw new AppError(400, `${field} must be at least ${min} characters`);
  }
  if (options.max && normalized.length > options.max) {
    throw new AppError(400, `${field} must be at most ${options.max} characters`);
  }
  return normalized;
}

export function requireEmail(value: unknown): string {
  const email = requireString(value, 'email', { max: 254 }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError(400, 'Invalid email format');
  }
  return email;
}

export function requirePositiveInteger(value: unknown, field: string): number {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && /^\d+$/.test(value)
        ? Number(value)
        : Number.NaN;
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new AppError(400, `${field} must be a positive integer`);
  }
  return parsed;
}

export function parsePagination(
  pageValue: unknown,
  limitValue: unknown
): { page: number; limit: number; offset: number } {
  const page = pageValue === undefined ? 1 : requirePositiveInteger(pageValue, 'page');
  const limit =
    limitValue === undefined ? 5 : requirePositiveInteger(limitValue, 'limit');
  if (limit > 100) {
    throw new AppError(400, 'limit must not exceed 100');
  }
  return { page, limit, offset: (page - 1) * limit };
}

export function requireRole(value: unknown): UserRole {
  if (typeof value !== 'string' || !USER_ROLES.includes(value as UserRole)) {
    throw new AppError(400, `role must be one of: ${USER_ROLES.join(', ')}`);
  }
  return value as UserRole;
}

export function requireTaskStatus(value: unknown): TaskStatus {
  if (
    typeof value !== 'string' ||
    !TASK_STATUSES.includes(value as TaskStatus)
  ) {
    throw new AppError(
      400,
      `status must be one of: ${TASK_STATUSES.join(', ')}`
    );
  }
  return value as TaskStatus;
}

export function requireDate(value: unknown, field: string): Date {
  if (typeof value !== 'string' && !(value instanceof Date)) {
    throw new AppError(400, `${field} must be a valid date`);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new AppError(400, `${field} must be a valid date`);
  }
  return date;
}
