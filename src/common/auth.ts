import { Response, NextFunction } from 'express';
import { ForbiddenError, UnAuthorizedError } from './error';
import { verifyJWT } from '../utils/jwtAuth/jwt';
import { prisma } from '../database/prisma.service';
import { AuthRequest } from '../modules/auth/auth.interface';

export const protect = (checkVerified: boolean = false) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const bearer = req.headers['authorization'];
    if (!bearer) {
      throw new UnAuthorizedError('No Authentication Credentials Provided');
    }

    const [, token] = bearer.split(' ');

    if (!token) {
      throw new UnAuthorizedError('No Token provided');
    }

    const payload = verifyJWT(token);
    if (!payload) {
      throw new UnAuthorizedError('Invalid or Expired Token');
    }

    // check the database if vendor with Id exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: payload.id },
    });
    if (!vendor) {
      throw new UnAuthorizedError('Vendor Not Found');
    }

    if (checkVerified && !vendor.verified) {
      throw new ForbiddenError('Please verify your Email Address to Continue');
    }
    // This prevents the client from using the refresh token for authentication
    req.payload = payload;
    next();
  };
};
