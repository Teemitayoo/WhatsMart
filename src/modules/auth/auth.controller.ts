import { Request, Response } from 'express';
import AuthService from './auth.service';
import { AuthRequest } from './auth.interface';

const authService = new AuthService();

export default class AuthController {
  signUp = async (req: Request, res: Response) => {
    const userInfo = req.body;
    await authService.signUp(userInfo);
    return res.status(201).json({
      success: true,
      message: 'A verification link has been sent to your email address!',
    });
  };

  signIn = async (req: Request, res: Response) => {
    const { whatsappNumber, password } = req.body;
    const data = await authService.signIn(whatsappNumber, password);
    return res.json({ success: true, data });
  };

  addAcountDetails = async (req: AuthRequest, res: Response) => {
    const id = req.payload!.id;
    const { accountName, accountNumber, bankName } = req.body;
    await authService.addAccountDetails(id, accountName, accountNumber, bankName);
    return res.status(201).json({
      success: true,
      message: 'Account Details added succesfully!',
    });
  };

  getAccessToken = async (req: Request, res: Response) => {
    const refreshToken = req.query.token as string;
    const accessToken = await authService.getAccessToken(refreshToken);
    return res.json({ success: true, data: { accessToken } });
  };

  logout = async (req: Request, res: Response) => {
    const refreshToken = req.query.token as string;
    await authService.deleteRefreshToken(refreshToken);
    return res.json({ success: true, message: 'Logout Successful' });
  };

  verifyEmail = async (req: Request, res: Response) => {
    const verificationToken = req.query.token as string;
    await authService.verifyEmail(verificationToken);
    return res.status(200).json({ success: true, message: 'Email has been verified' });
  };

  getVerficiationMail = async (req: AuthRequest, res: Response) => {
    const email = req.payload!.email;
    await authService.getVerificationMail(email);
    return res.json({
      success: true,
      message: 'A verification link has been sent to your email address!',
    });
  };
}
