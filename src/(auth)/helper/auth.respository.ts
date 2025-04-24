import { User } from "../../models";
import bcrypt from 'bcrypt';

export class AuthRepository {
  async findUserByEmail(email: string) {
    return await User.findOne({ where: { email } });
  }

  async createUser(data: any) {
    return await User.create(data);
  }

  async findUserById(id: number) {
    return await User.findByPk(id);
  }

  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }
}