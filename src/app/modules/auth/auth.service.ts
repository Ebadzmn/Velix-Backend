import bcrypt from 'bcrypt';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { jwtHelper } from '../../../helpers/jwtHelper';
import { createResetPasswordEmailTemplate } from '../../../shared/emailTemplate';
import { ILoginUserResponse } from '../../../types/auth';
import { generateOTP } from '../../../util/generateOTP';
import { ResetToken } from '../resetToken/resetToken.model';
import { User } from '../user/user.model';

const loginUser = async (payload: { email: string; password: string }): Promise<ILoginUserResponse> => {
  const { email, password } = payload;

  const isUserExist = await User.isUserExist(email);
  if (!isUserExist) {
    throw new ApiError(404, 'User does not exist');
  }

  if (isUserExist.status === 'blocked') {
    throw new ApiError(403, 'User is blocked');
  }

  if (
    isUserExist.password &&
    !(await User.isPasswordMatched(password, isUserExist.password))
  ) {
    throw new ApiError(400, 'Password does not match');
  }

  const accessToken = jwtHelper.createToken(
    { userId: isUserExist._id, role: isUserExist.role, email: isUserExist.email },
    config.jwt.secret,
    config.jwt.expires_in
  );

  const refreshToken = jwtHelper.createToken(
    { userId: isUserExist._id, role: isUserExist.role, email: isUserExist.email },
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in
  );

  const userObj = JSON.parse(JSON.stringify(isUserExist));
  delete userObj.password;

  return {
    accessToken,
    refreshToken,
    user: userObj,
  };
};

const refreshToken = async (token: string): Promise<ILoginUserResponse> => {
  let verifiedToken = null;
  try {
    verifiedToken = jwtHelper.verifyToken(token, config.jwt.refresh_secret);
  } catch (err) {
    throw new ApiError(403, 'Invalid Refresh Token');
  }

  const { userId } = verifiedToken;

  const isUserExist = await User.findById(userId);
  if (!isUserExist) {
    throw new ApiError(404, 'User does not exist');
  }

  const newAccessToken = jwtHelper.createToken(
    { userId: isUserExist._id, role: isUserExist.role, email: isUserExist.email },
    config.jwt.secret,
    config.jwt.expires_in
  );

  return {
    accessToken: newAccessToken,
  };
};

const forgotPassword = async (email: string): Promise<void> => {
  const isUserExist = await User.findOne({ email });
  if (!isUserExist) {
    throw new ApiError(404, 'User not found with this email');
  }

  const otp = generateOTP(6);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Delete existing OTP for this email
  await ResetToken.deleteMany({ email });

  // Save new OTP
  await ResetToken.create({
    user: isUserExist._id,
    email: isUserExist.email,
    otp,
    expiresAt,
  });

  const userName = isUserExist.name || `${isUserExist.firstName} ${isUserExist.lastName}` || 'User';
  const html = createResetPasswordEmailTemplate(userName, otp);

  await emailHelper.sendEmail({
    to: isUserExist.email,
    subject: 'Password Reset OTP Code',
    html,
  });
};

const verifyOtp = async (payload: { email: string; otp: string }): Promise<boolean> => {
  const { email, otp } = payload;

  const isOtpValid = await ResetToken.findOne({
    email,
    otp,
    expiresAt: { $gt: new Date() },
  });

  if (!isOtpValid) {
    throw new ApiError(400, 'Invalid or expired OTP code');
  }

  return true;
};

const resetPassword = async (payload: {
  email: string;
  otp: string;
  newPassword: string;
}): Promise<void> => {
  const { email, otp, newPassword } = payload;

  const resetTokenDoc = await ResetToken.findOne({
    email,
    otp,
    expiresAt: { $gt: new Date() },
  });

  if (!resetTokenDoc) {
    throw new ApiError(400, 'Invalid or expired OTP code');
  }

  const newHashedPassword = await bcrypt.hash(newPassword, config.bcrypt_salt_rounds);

  await User.findOneAndUpdate(
    { email },
    { password: newHashedPassword },
    { new: true }
  );

  // Delete used OTP
  await ResetToken.deleteMany({ email });
};

export const AuthService = {
  loginUser,
  refreshToken,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
