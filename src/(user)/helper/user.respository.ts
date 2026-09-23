import { User } from '../../models';
import { Task } from '../../models';
import { Op, WhereOptions } from 'sequelize';

export class UserRepository {
  findAll(filter: WhereOptions<User>, limit: number, offset: number) {
    return User.findAll({
      where: filter,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  }

  countAll(filter: WhereOptions<User>) {
    return User.count({ where: filter });
  }

  findById(id: number) {
    return User.findByPk(id);
  }

  findByEmail(email: string) {
    return User.findOne({ where: { email: { [Op.iLike]: email } } });
  }

  findOne(where: WhereOptions<User>) {
    return User.findOne({ where });
  }

  deleteById(id: number) {
    return User.destroy({ where: { id } });
  }

  save(user: User) {
    return user.save();
  }

  countAssignedTasks(id: number) {
    return Task.count({ where: { assigned_to: id } });
  }

  findAssignedTasks(id: number) {
    return Task.findAll({
      where: { assigned_to: id },
      order: [['createdAt', 'DESC']],
    });
  }
}
