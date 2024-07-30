import { Request, Response } from 'express';
import { config } from '../../../config';
import moment from 'moment';
import publicIP from 'ip';
import HTTP_STATUS from 'http-status-codes';
import { authService } from '../../../shared/services/db/auth.service';
import { IAuthDocument } from '../interfaces/auth.interface';
import { joiValidation } from '../../../shared/global/decorators/joi-validation.decoration';
import { emailSchema, passwordSchema } from '../schemes/password';
import crypto from 'crypto';
import { emailQueue } from '../../../shared/services/queues/email.queue';
import { IResetPasswordParams } from '../../user/interfaces/user.interface';
import { resetPasswordTemplate } from '../../../shared/services/emails/templates/reset-password/reset-password-template';
import { BadRequestError } from '../../../shared/global/helpers/error-handler';
import { forgotPasswordTemplate } from '../../../shared/services/emails/templates/forgot-password/forgot-password';

export class Password {
  @joiValidation(emailSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    // fetching the user by email ID
    const existingUser: IAuthDocument = await authService.getAuthUserByEmail(email);
    if (!existingUser) {
      // if user email is not present in DB
      throw new BadRequestError('Invalid credentials');
    }

    // generating random token
    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');

    // token valid for 1hrs
    await authService.updatePasswordToken(`${existingUser._id!}`, randomCharacters, Date.now() * 60 * 60 * 1000);

    // setting reset password link
    const resetLink = `${config.CLIENT_URL}/reset-password?token=${randomCharacters}`;

    // generating password reset template by passing required parameters
    const template: string = forgotPasswordTemplate.passwordResetTemplate(existingUser.username!, resetLink);

    // Adding password reset email to the email queue
    emailQueue.addEmailJob('forgotPasswordEmail', { template, receiverEmail: email, subject: 'Reset your password' });

    // sending the response back to the client sayaing email sent.
    res.status(HTTP_STATUS.OK).json({ message: 'Password reset email sent.' });
  }


  @joiValidation(passwordSchema)
  public async update(req: Request, res: Response): Promise<void> {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;

    // validating both the password & confirmPassword are matching
    if (password !== confirmPassword) {
      throw new BadRequestError('Passwords do not match');
    }

    // fetching the auth user by passwordToken
    // validating passwordResetToken and passwordResetExpires for user
    const existingUser: IAuthDocument = await authService.getAuthUserByPasswordToken(token);
    if (!existingUser) {
      throw new BadRequestError('Reset token has expired.');
    }

    // setting the password info
    existingUser.password = password;
    existingUser.passwordResetExpires = undefined;
    existingUser.passwordResetToken = undefined;
    await existingUser.save();

    // generating email template
    const templateParams: IResetPasswordParams = {
      username: existingUser.username!,
      email: existingUser.email!,
      ipaddress: publicIP.address(),
      date: moment().format('DD//MM//YYYY HH:mm')
    };
    const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);

    // adding password reset confirmation email to email queue
    emailQueue.addEmailJob('forgotPasswordEmail', { template, receiverEmail: existingUser.email!, subject: 'Password Reset Confirmation' });

    // sending the reponse to the client
    res.status(HTTP_STATUS.OK).json({ message: 'Password successfully updated.' });
  }
}
