import { UserRole } from '../../models/user.model';

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}
