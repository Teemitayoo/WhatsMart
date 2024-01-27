import { Request } from 'express';

export interface jwtPayload {
  id: string;
  email: string;
  type: string;
}

export interface AuthRequest extends Request {
  payload?: jwtPayload;
}
