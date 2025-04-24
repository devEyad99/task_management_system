import { User } from '../../models';

export class UserRepository {
  findAll(filter: any, limit: number, offset: number) {
    return User.findAll({ where: filter, limit, offset });
  }

  countAll(filter: any) {
    return User.count({ where: filter });
  }

  findById(id: number) {
    return User.findByPk(id);
  }

  findOne(where: any) {
    return User.findOne({ where });
  }

  deleteById(id: number) {
    return User.destroy({ where: { id } });
  }

  save(user: any) {
    return user.save();
  }
}
