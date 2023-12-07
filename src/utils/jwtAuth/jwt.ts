import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { jwtPayload } from '../../modules/auth/auth.interface';
import { Vendor } from '@prisma/client';

export const hashPassword = (password: string) => {
  return bcrypt.hash(password, 5);
};

export const comparePassword = (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

const secret: string | undefined = process.env.JWT_SECRET as string;

export const createAcessToken = (vendor: Vendor) => {
  const token = jwt.sign({ id: vendor.id, email: vendor.email, type: 'access' }, secret, {
    expiresIn: process.env.ACESSTOKEN_EXPIRESAT,
  });

  return token;
};

export const createRefreshToken = (vendor: Vendor) => {
  const token = jwt.sign({ id: vendor.id, email: vendor.email, type: 'refresh' }, secret, {
    expiresIn: process.env.REFRESHTOKEN_EXPIRESAT,
  });

  return token;
};

export const createResetToken = (email: string, id: string) => {
  const token = jwt.sign({ email, id, type: 'reset' }, secret, {
    expiresIn: process.env.RESETTOKEN_EXPIRESAT,
  });
  return token;
};

export const createVerificationToken = (email: string, id: string) => {
  const token = jwt.sign({ id, email, type: 'verify' }, secret, {
    expiresIn: process.env.VERIFICATION_EXPIRESAT,
  });
  return token;
};

export const verifyJWT = (token: string): jwtPayload | null => {
  try {
    const payload = jwt.verify(token, secret);
    return payload as jwtPayload;
  } catch (e) {
    return null;
  }
};
