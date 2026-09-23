import {
  getAccessToken,
  getRefreshToken,
  verifyRefreshToken,
} from '../utiles/jwt';
import { AuthRepository } from './helper/auth.respository';
import { AppError } from '../errors/AppError';
import {
  rejectUnknownFields,
  requireEmail,
  requireObject,
  requireString,
} from '../helper/validation';
import { ICurrentUser } from '../interfaces/ICurrentUser';
import User from '../models/user.model';
import { UserLoginDto } from './dto/userLogin.dto';

function toPublicUser(user: User): ICurrentUser & {
  createdAt: Date;
  updatedAt: Date;
} {
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

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async signup(input: unknown) {
    const data = requireObject(input);
    rejectUnknownFields(data, ['name', 'email', 'password', 'role']);
    const name = requireString(data.name, 'name', { min: 2, max: 100 });
    const email = requireEmail(data.email);
    const password = requireString(data.password, 'password', {
      min: 8,
      max: 72,
    });
    if (Buffer.byteLength(password, 'utf8') > 72) {
      throw new AppError(400, 'password must not exceed 72 bytes');
    }

    // Public registration must never mint elevated accounts.
    if (data.role !== undefined && data.role !== 'employee') {
      throw new AppError(403, 'Public signup only supports the employee role');
    }

    const existingUser = await this.authRepository.findUserByEmail(email);
    if (existingUser) {
      throw new AppError(409, 'User already exists');
    }

    const hashedPassword = await this.authRepository.hashPassword(password);
    const user = await this.authRepository.createUser({
      name,
      email,
      password: hashedPassword,
      role: 'employee',
    });
    const tokenPayload = { email: user.email, role: user.role, id: user.id };

    return {
      message: 'User created successfully',
      token: getAccessToken(tokenPayload),
      user: toPublicUser(user),
    };
  }

  async login(input: unknown) {
    const data = requireObject(input);
    rejectUnknownFields(data, ['email', 'password']);
    const email = requireEmail(data.email);
    const password = requireString(data.password, 'password', { max: 72 });
    const credentials: UserLoginDto = { email, password };
    const user = await this.authRepository.findUserByEmail(credentials.email);
    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    const isValidPassword = await this.authRepository.comparePassword(
      credentials.password,
      user.password
    );
    if (!isValidPassword) {
      throw new AppError(401, 'Invalid email or password');
    }

    const tokenPayload = { email: user.email, role: user.role, id: user.id };
    return {
      message: 'User Login successful',
      token: getAccessToken(tokenPayload),
      refreshToken: getRefreshToken(tokenPayload),
      user: toPublicUser(user),
    };
  }

  async refreshToken(input: unknown) {
    const body = requireObject(input);
    rejectUnknownFields(body, ['refreshToken']);
    const refreshToken = requireString(body.refreshToken, 'refreshToken');

    const tokenUser = verifyRefreshToken(refreshToken);
    const user = await this.authRepository.findUserById(tokenUser.id);
    if (!user) {
      throw new AppError(401, 'Invalid token. Please log in again.');
    }

    const tokenPayload = { email: user.email, role: user.role, id: user.id };
    return {
      message: 'Refresh token generated successfully',
      access_token: getAccessToken(tokenPayload),
      refresh_token: getRefreshToken(tokenPayload),
    };
  }
}
