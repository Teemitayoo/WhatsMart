import express from 'express';
import 'express-async-errors';
import { protect } from '../../common/auth';
import AuthController from './auth.controller';
import { validate } from '../../common/zod';
import { signupSchema, signinSchema } from './auth.dto';

const router = express.Router();
const authController = new AuthController();

router.post('/signup', validate(signupSchema), authController.signUp);
router.post('/signin', validate(signinSchema), authController.signIn);
router.post('/logout', protect(true), authController.logout);
router.post('/add-account-details', protect(true), authController.addAcountDetails);
router.get('/access-token', authController.getAccessToken);
router.get('/verification', protect(), authController.getVerficiationMail);
router.get('/verify-email', authController.verifyEmail);
export default router;
