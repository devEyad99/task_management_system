import { User } from "../../models";
import bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/createUser.dto';
import { Op } from 'sequelize';

type UserCreationData = Omit<CreateUserDto, 'role'> & {
  password: string;
  role: 'employee';
};

export class AuthRepository {
  async findUserByEmail(email: string) {
    return User.scope('withPassword').findOne({
      where: { email: { [Op.iLike]: email } },
    });
  }

  async createUser(data: UserCreationData) {
    return User.create(data);
  }

  async findUserById(id: number) {
    return User.findByPk(id);
  }

  async hashPassword(password: string) {
    return bcrypt.hash(password, 12);
  }

  async comparePassword(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
  }
}
