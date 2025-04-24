import { Task, User } from '../../models';
import { Op } from 'sequelize';

export class TaskRepository {
  async createTask(data: any) {
    return Task.create(data);
  }

  async findUserById(userId: number) {
    return User.findOne({ where: { id: userId } });
  }

  async countTasksByTitle(title?: string) {
    const whereClause = title ? { title: { [Op.like]: `%${title}%` } } : {};
    return Task.count({ where: whereClause });
  }

  async findTasks(title?: string, limit?: number, offset?: number) {
    const whereClause = title ? { title: { [Op.like]: `%${title}%` } } : {};
    return Task.findAll({ where: whereClause, limit, offset });
  }

  async findTaskById(id: string) {
    return Task.findByPk(id);
  }

  async deleteTask(id: string) {
    return Task.destroy({ where: { id } });
  }
}
