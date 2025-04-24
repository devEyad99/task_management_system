import { UserRepository } from './helper/user.respository';
import { Op } from 'sequelize';
import _ from 'lodash';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getAllUsers(limit: number, page: number, name?: string) {
    const offset = (page - 1) * limit;
    const whereClause = name ? { name: { [Op.like]: `%${name}%` } } : {};

    const users = await this.userRepository.findAll(whereClause, limit, offset);
    const totalUsers = await this.userRepository.countAll(whereClause);

    return {
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      results: users.length,
      allUsers: users.map((u: any) => _.omit(u.toJSON(), 'password')),
    };
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new Error('User not found');
    return _.omit(user.toJSON(), 'password');
  }

  async getMe(currentUser: any, tasks: any[]) {
    return {
      user: currentUser,
      tasks,
    };
  }

  async deleteUserById(id: number) {
    const user = await this.userRepository.findOne({ id });
    if (!user) throw new Error('User not found');
    await this.userRepository.deleteById(id);
    return { message: 'User deleted successfully' };
  }

  async updateUser(id: number, data: any) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new Error('User not found');

    Object.assign(user, data);
    return this.userRepository.save(user);
  }

  async uploadProfileImage(id: number, filename: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new Error('User not found');

    user.profile_image = `/uploads/${encodeURIComponent(filename)}`;
    return this.userRepository.save(user);
  }
}