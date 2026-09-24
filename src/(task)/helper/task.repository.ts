import { Task, User } from '../../models';
import { Op, WhereOptions } from 'sequelize';
import { CreateTaskDto } from '../dto';

export class TaskRepository {
  async createTask(data: CreateTaskDto) {
    return Task.create(data);
  }

  async findUserById(userId: number) {
    return User.findOne({ where: { id: userId } });
  }

  private getTitleFilter(title?: string): WhereOptions<Task> {
    return title ? { title: { [Op.iLike]: `%${title}%` } } : {};
  }

  async countTasksByTitle(title?: string) {
    const whereClause = this.getTitleFilter(title);
    return Task.count({ where: whereClause });
  }

  async findTasks(title: string | undefined, limit: number, offset: number) {
    const whereClause = this.getTitleFilter(title);
    return Task.findAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  }

  async findTaskById(id: number) {
    return Task.findByPk(id);
  }

  async deleteTask(id: number) {
    return Task.destroy({ where: { id } });
  }

  async findTasksByUserId(userId: number) {
    return Task.findAll({
      where: { assigned_to: userId },
      order: [['createdAt', 'DESC']],
    });
  }

  async saveTask(task: Task) {
    return task.save();
  }
}
