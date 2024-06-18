import { Vendor } from '@prisma/client';
import { BadRequestError, ConflictError, UnAuthorizedError } from '../../common/error';
import {
  comparePassword,
  createAcessToken,
  createRefreshToken,
  createResetToken,
  createVerificationToken,
  hashPassword,
  verifyJWT,
} from '../../utils/jwtAuth/jwt';
import { verifyemailTemplate } from '../mail/mailTemplates/verifyemail';
import MailService from '../mail/mail.service';
import AuthRepository from './auth.repository';
import { jwtPayload } from './auth.interface';
import { sendWhatsAppMessage } from './whatsapp';

const authRepository = new AuthRepository();
const mailService = new MailService();

export default class authService {
  private generateRandomPassword(length: number): string {
    const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialCharacters = '!@#$%^&*()-_=+[]{}|;:,.<>?/';

    const allCharacters = uppercaseLetters + lowercaseLetters + numbers + specialCharacters;

    let password = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * allCharacters.length);
      password += allCharacters.charAt(randomIndex);
    }

    return password;
  }
  
  private generateRandomSubdomain() {
    const randomChars = 'abcdefghijklmnopqrstuvwxyz';
    const defaultSubdomain = Array.from(
      { length: 10 },
      () => randomChars[Math.floor(Math.random() * randomChars.length)],
    ).join('');
    return defaultSubdomain;
  }

  async isSubdomainTaken(defaultSubdomain: string) {
    const existingVendor = await authRepository.getVendor({ defaultSubdomain });

    return !!existingVendor;
  }

  async signUp(vendorInfo: any): Promise<void> {
    let { email, whatsappNumber, storeName } = vendorInfo;
    const generatedPassword: string = this.generateRandomPassword(10);
    //console.log(generatedPassword);
    const password = await hashPassword(generatedPassword);

    try {
      let defaultSubdomain;
      do {
        // Generate a random subdomain
        defaultSubdomain = this.generateRandomSubdomain();
      } while (await this.isSubdomainTaken(defaultSubdomain));
      const vendor = await authRepository.createVendor({
        email,
        password,
        whatsappNumber,
        storeName,
        defaultSubdomain,
      });
      const verificationToken = createVerificationToken(email, vendor.id);
      const id = vendor.id;
      await authRepository.updateVendor({ id }, { verificationToken });
      await this.sendVerificationMail(email, verificationToken, vendor.storeName);
      const message = await sendWhatsAppMessage(whatsappNumber, whatsappNumber, generatedPassword);
      console.log(message);
    } catch (err: any) {
      throw new ConflictError('Email Already Exists. Please use another email Adress');
    }
  }
  public sendVerificationMail = async (
    email: string,
    verificationtoken: string,
    storename: string,
  ) => {
    const verifyEmailUrl = `${process.env.FRONTENDURL}/verify_email.php?token=${verificationtoken}`;
    const mailtemplate = verifyemailTemplate(storename, verifyEmailUrl);
    await mailService.sendMail({
      to: email,
      subject: 'Verify Your Email Address',
      html: mailtemplate,
    });
  };

  async verifyEmail(verificationToken: string): Promise<string> {
    const jwtPayload = this.verifyJwtandThrow(verificationToken);
    const { email, id } = jwtPayload;
    const vendor = (await authRepository.getVendorData(id)) as Vendor;
    const frontendUrl = process.env.FRONTENDURL;
    if (!vendor || vendor.verificationToken != verificationToken) {
      return `${frontendUrl}/verify`;
    }
    await authRepository.updateVendor({ email }, { verificationToken: null, verified: true });
    return `${frontendUrl}/verified`;
  }

  async signIn(whatsappNumber: string, _password: string) {
    try {
      const vendor = await authRepository.getVendor({ whatsappNumber });
      if (!vendor) {
        throw new UnAuthorizedError('Invalid Login Credentials');
      }

      const checkPassword = await comparePassword(_password, vendor.password!);
      if (!checkPassword) {
        throw new UnAuthorizedError('Invalid Login Credentials');
      }
      const { refreshToken, accessToken } = await this.generateToken(vendor);
      const { password, ...vendorwithoutPassword } = vendor;
      return { accessToken, refreshToken, vendor: vendorwithoutPassword };
    } catch (err: any) {
      throw new BadRequestError('Wrong details provided');
    }
  }
  async addAccountDetails(
    id: string,
    accountName: string,
    accountNumber: string,
    bankName: string,
  ) {
    try {
      const vendor = await authRepository.getVendor({ id });
      if (!vendor) {
        throw new UnAuthorizedError('Invalid Login Credentials');
      }
      await authRepository.updateVendor({ id }, { accountName, accountNumber, bankName });
    } catch (err: any) {
      throw new BadRequestError('Wrong details provided');
    }
  }

  private async generateToken(vendor: any) {
    const accessToken = createAcessToken(vendor);
    const refreshToken = createRefreshToken(vendor);
    const expiresAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    console.log(expiresAt);
    const id = vendor.id;
    await authRepository.createRefreshToken({
      token: refreshToken,
      expiresAt,
      vendor: { connect: { id } },
    });
    return { refreshToken, accessToken };
  }

  async getAccessToken(refreshToken: string): Promise<string> {
    const verifiedPayload = this.verifyJwtandThrow(refreshToken);
    const token = await authRepository.getRefreshToken(refreshToken);
    if (!token || token.expiresAt < new Date()) {
      throw new UnAuthorizedError('Invalid Token Provided');
    }
    const email = verifiedPayload.email;
    const user = (await authRepository.getVendor({
      email,
    })) as unknown as Vendor;
    const acessToken = createAcessToken(user);
    return acessToken;
  }

  private verifyJwtandThrow(token: string): jwtPayload {
    const verifiedPayload = verifyJWT(token);
    if (!verifiedPayload) {
      throw new UnAuthorizedError('Invalid or Expired Token!');
    }
    return verifiedPayload;
  }

  async deleteRefreshToken(refreshToken: string) {
    this.verifyJwtandThrow(refreshToken) as jwtPayload;
    const token = await authRepository.getRefreshToken(refreshToken);
    if (token) {
      return await authRepository.deleteRefreshToken(refreshToken);
    } else {
      throw new UnAuthorizedError('Invalid or Expired Token');
    }
  }
  async getVerificationMail(email: string) {
    const vendor = await authRepository.getVendor({ email });
    if (!vendor) {
      throw new BadRequestError('Email does not exist, Please sign up on dash to get started');
    }
    if (!vendor.verified) {
      await authRepository.updateVendor({ email }, { verificationToken: null });
      const verificationToken = createVerificationToken(email, vendor.id);
      await authRepository.updateVendor({ email }, { verificationToken });
      this.sendVerificationMail(email, verificationToken, vendor.storeName);
    }
  }
}
