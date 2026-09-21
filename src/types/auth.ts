import { ENUM_USER_ROLE } from '../enums/user';
import { IUser } from '../app/modules/user/user.interface';

export type IAuthUser = {
  userId: string;
  role: ENUM_USER_ROLE;
  email: string;
};

export type ILoginUserResponse = {
  accessToken: string;
  refreshToken?: string;
  user?: Partial<IUser>;
};
