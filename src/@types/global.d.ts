import { Request } from 'express';
import { ICurrentUser } from '../interfaces/ICurrentUser';

declare global {
  declare namespace Express {
    export interface Request {
      currentUser?: ICurrentUser;
    }
  }
}
