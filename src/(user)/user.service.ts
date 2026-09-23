import { UserRepository } from './helper/user.respository';
import { Op, WhereOptions } from 'sequelize';
import { AppError } from '../errors/AppError';
import {
  parsePagination,
  rejectUnknownFields,
  requireEmail,
  requireObject,
  requirePositiveInteger,
  requireRole,
  requireString,
  requireTaskStatus,
} from '../helper/validation';
import User from '../models/user.model';
import { ICurrentUser } from '../interfaces/ICurrentUser';
import { TaskRepository } from '../(task)/helper/task.repository';

function toPublicUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    profile_image: user.profile_image,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly taskRepository: TaskRepository
  ) {}

  async getAllUsers(query: Record<string, unknown>) {
    const { limit, offset } = parsePagination(query.page, query.limit);
    const name =
      query.name === undefined
        ? undefined
        : requireString(query.name, 'name', { max: 100 });
    const whereClause: WhereOptions<User> = name
      ? { name: { [Op.iLike]: `%${name}%` } }
      : {};

    const [users, totalUsers] = await Promise.all([
      this.userRepository.findAll(whereClause, limit, offset),
      this.userRepository.countAll(whereClause),
    ]);

    return {
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      results: users.length,
      allUsers: users.map(toPublicUser),
    };
  }

  async getUserById(idValue: unknown) {
    const id = requirePositiveInteger(idValue, 'id');
    const user = await this.userRepository.findById(id);
    if (!user) throw new AppError(404, 'User not found');
    return toPublicUser(user);
  }

  async getMe(currentUser: ICurrentUser) {
    const tasks = await this.userRepository.findAssignedTasks(currentUser.id);
    return {
      user: currentUser,
      tasks,
    };
  }

  async deleteUserById(idValue: unknown) {
    const id = requirePositiveInteger(idValue, 'id');
    const user = await this.userRepository.findOne({ id });
    if (!user) throw new AppError(404, 'User not found');
    const assignedTaskCount = await this.userRepository.countAssignedTasks(id);
    if (assignedTaskCount > 0) {
      throw new AppError(409, 'Cannot delete a user with assigned tasks');
    }
    await this.userRepository.deleteById(id);
    return { message: 'User deleted successfully' };
  }

  async updateUser(idValue: unknown, input: unknown) {
    const id = requirePositiveInteger(idValue, 'id');
    const data = requireObject(input);
    rejectUnknownFields(data, ['name', 'email', 'role']);
    if (Object.keys(data).length === 0) {
      throw new AppError(400, 'At least one field must be provided');
    }
    const user = await this.userRepository.findById(id);
    if (!user) throw new AppError(404, 'User not found');

    if (data.name !== undefined) {
      user.name = requireString(data.name, 'name', { min: 2, max: 100 });
    }
    if (data.email !== undefined) {
      const email = requireEmail(data.email);
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser && existingUser.id !== user.id) {
        throw new AppError(409, 'User already exists');
      }
      user.email = email;
    }
    if (data.role !== undefined) {
      user.role = requireRole(data.role);
    }
    const updatedUser = await this.userRepository.save(user);
    return toPublicUser(updatedUser);
  }

  async uploadProfileImage(id: number, filename: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new AppError(404, 'User not found');

    user.profile_image = `/uploads/${encodeURIComponent(filename)}`;
    return this.userRepository.save(user);
  }

  async getMyTasks(currentUser: ICurrentUser) {
    return this.taskRepository.findTasksByUserId(currentUser.id);
  }

  async updateTaskStatus(
    currentUser: ICurrentUser,
    idValue: unknown,
    input: unknown
  ) {
    const id = requirePositiveInteger(idValue, 'id');
    const data = requireObject(input);
    rejectUnknownFields(data, ['status']);
    const status = requireTaskStatus(data.status);
    const task = await this.taskRepository.findTaskById(id);
    if (!task) throw new AppError(404, 'Task not found');
    if (task.assigned_to !== currentUser.id) {
      throw new AppError(403, 'You are not allowed to update this task');
    }
    return this.taskRepository.updateStatus(task, status);
  }
}
