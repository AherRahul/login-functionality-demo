import { Request, Response } from 'express';
import { config } from '../../../config';
import JWT from 'jsonwebtoken';
import { joiValidation } from '../../../shared/global/decorators/joi-validation.decoration';
import HTTP_STATUS from 'http-status-codes';
import { authService } from '../../../shared/services/db/auth.service';
import { loginSchema } from '../schemes/signin';
import { IAuthDocument } from '../../auth/interfaces/auth.interface';
import { BadRequestError } from '../../../shared/global/helpers/error-handler';
import { userService } from '../../../shared/services/db/user.service';
import { IResetPasswordParams, IUserDocument } from '../../user/interfaces/user.interface';
// import { forgotPasswordTemplate } from '../../../shared/services/emails/templates/forgot-password/forgot-password';
import { emailQueue } from '../../../shared/services/queues/email.queue';
import moment from 'moment';
import publicIP from 'ip';
import { resetPasswordTemplate } from '../../../shared/services/emails/templates/reset-password/reset-password-template';

export class SignIn {
  @joiValidation(loginSchema)
  public async read(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;
    const existingUser: IAuthDocument =
      await authService.getAuthUserByUsername(username);
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const passwordsMatch: boolean =
      await existingUser.comparePassword(password);
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials');
    }

    const user: IUserDocument = await userService.getUserByAuthId(
      `${existingUser._id}`,
    );

    const userJwt: string = JWT.sign(
      {
        userId: user._id,
        uId: existingUser.uId,
        email: existingUser.email,
        username: existingUser.username,
        avatarColor: existingUser.avatarColor,
      },
      config.JWT_TOKEN!,
    );

    // const templateParams: IResetPasswordParams = {
    //   username: existingUser.username!,
    //   email: existingUser.email!,
    //   ipaddress: publicIP.address(),
    //   date: moment().format('DD/MM/YYY HH:mm')
    // };
    // // const resetLink = `${config.CLIENT_URL}/reset-password?token=12345678`;
    // const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    // emailQueue.addEmailJob('forgotPasswordEmail', { template, receiverEmail: 'rahulvijayaher@gmail.com', subject: 'Password reset comfirmation your password'});

    req.session = { jwt: userJwt };

    const userDocument: IUserDocument = {
      ...user,
      authId: existingUser!._id,
      username: existingUser!.username,
      email: existingUser!.email,
      avatarColor: existingUser!.avatarColor,
      uId: existingUser!.uId,
      createdAt: existingUser!.createdAt,
    } as IUserDocument;
    res
      .status(HTTP_STATUS.OK)
      .json({
        message: 'User login successfully',
        user: userDocument,
        token: userJwt,
      });
  }
}
