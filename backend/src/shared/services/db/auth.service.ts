import { IAuthDocument } from '../../../features/auth/interfaces/auth.interface';
import { AuthModel } from '../../../features/auth/models/auth.schema';
import { Helpers } from '../../global/helpers/helpers';

class AuthService {
  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }


  // update the user by passwordToken
  public async updatePasswordToken(
    authId: string,
    token: string,
    tokenExpiration: number,
  ): Promise<void> {
    await AuthModel.updateOne(
      { _id: authId },
      {
        passwordResetToken: token,
        passwordResetExpires: tokenExpiration,
      },
    );
  }


  // fetching the user by email ID or by user-name
  public async getUserByUsernameOrEmail(
    username: string,
    email: string,
  ): Promise<IAuthDocument> {
    const query = {
      $or: [
        { username: Helpers.firstLetterUppercase(username) },
        { email: Helpers.lowerCase(email) },
      ],
    };
    const user: IAuthDocument = (await AuthModel.findOne(
      query,
    ).exec()) as IAuthDocument;
    return user;
  }


  // fetching the auth user by username
  public async getAuthUserByUsername(username: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({
      username: Helpers.firstLetterUppercase(username),
    }).exec()) as IAuthDocument;
    return user;
  }


  // fetching the auth user by email
  public async getAuthUserByEmail(email: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({
      email: Helpers.lowerCase(email),
    }).exec()) as IAuthDocument;
    return user;
  }


  // fetching the auth user by passwordToken
  public async getAuthUserByPasswordToken(
    token: string,
  ): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({
      // if token exist or not
      passwordResetToken: token,
      // checking the date is greater than date.now (valid token) if so then it's return else no doc return
      passwordResetExpires: { $gt: Date.now() },
    }).exec()) as IAuthDocument;
    return user;
  }
}

export const authService: AuthService = new AuthService();
