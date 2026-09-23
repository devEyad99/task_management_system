//
import { UserRole } from '../models/user.model';

export interface ICurrentUser {
  name: string;
  email: string;
  role: UserRole;
  id: number;
  profile_image: string | null;
}

export type AuthTokenPayload = Pick<ICurrentUser, 'email' | 'role' | 'id'>;
