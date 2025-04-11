import type * as express from 'express';
import { UserRequestType } from '../user-request-type';

declare global {
  namespace Express {
    export interface Request {
      user?: UserRequestType;
    }
  }
}
