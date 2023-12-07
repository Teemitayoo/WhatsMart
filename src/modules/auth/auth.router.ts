import express from 'express';
import 'express-async-errors';
import { protect } from '../../common/auth';
import AuthController from './auth.controller';

const router = express.Router();
const authController = new AuthController();

router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);
router.post('/logout', protect(true), authController.logout);
router.get('/access-token', authController.getAccessToken);
router.get('/verification', protect(), authController.getVerficiationMail);
router.get('/verify-email', authController.verifyEmail);
export default router;
