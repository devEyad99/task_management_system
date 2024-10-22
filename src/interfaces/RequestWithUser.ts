//
import { Request } from 'express';
import { ICurrentUser } from './ICurrentUser';

export interface RequestWithUser extends Request {
  currentUser?: ICurrentUser;
}
