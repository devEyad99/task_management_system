import { User } from "../models";

import _ from 'lodash';
import validator from 'validator';
import {
  getAccessToken,
  getRefreshToken,
  verifyRefreshToken,
} from '../utiles/jwt';
import { CreateUserDto } from "./dto/createUser.dto";
import { AuthRepository } from "./helper/auth.respository";
import { UserLoginDto } from "./dto/userLogin.dto";

export class AuthService {
  constructor(
    private readonly authRepository : AuthRepository,
  ) {}
  async signup(data: CreateUserDto) {
    try {
      if (!validator.isEmail(data.email)) {
        throw new Error('Invalid email format');
      }

      const existingUser = await this.authRepository.findUserByEmail(data.email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      const hashedPassword = await this.authRepository.hashPassword(data.password);
      const user = await this.authRepository.createUser({
        ...data,
        password: hashedPassword,
      });

      const userWithoutPassword = _.omit(user.toJSON(), 'password');

      const token = getAccessToken({ email: data.email, role: data.role, id: user.id });

      return {
        message: 'User created successfully',
        token,
        user: userWithoutPassword,
      };
    } catch (error) {
      console.error(error);
      throw new Error('Internal Server Error');
    }
  }

  async login(data: UserLoginDto) {
    const user = await this.authRepository.findUserByEmail(data.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await this.authRepository.comparePassword(data.password, user.password);
      if (!isValidPassword) {
       throw new Error('Invalid email or password');
  }

  const userWithoutPassword = _.omit(user.toJSON(), 'password');

  const token = getAccessToken({ email: data.email, role: user.role, id: user.id });
  const refreshToken = getRefreshToken({
    email: user.email,
    role: user.role,
    id: user.id,
  });
  return {
    message: 'User Login successful',
    token,
    refreshToken,
    user: userWithoutPassword,
  };
 }

 async refreshToken(refreshToken: string) {
   try {
     const currentUser = verifyRefreshToken(refreshToken);
     const accessToken = getAccessToken({
       email: currentUser.email,
       role: currentUser.role,
       id: currentUser.id,
     });
     const newRefreshToken = getRefreshToken({
       email: currentUser.email,
       role: currentUser.role,
       id: currentUser.id,
     });
     return {
       access_token: accessToken,
       refresh_token: newRefreshToken,
     };
   } catch (error) {
     console.error('Token verification failed:', error);
     throw new Error('Invalid token. Please log in again.');
   }
 }
}