import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { jwtHelper } from '../../../helpers/jwtHelper';
import { userSearchableFields } from '../../../shared/constrant';
import QueryBuilder from '../../builder/QueryBuilder';
import { IUser } from './user.interface';
import { User } from './user.model';

const createUser = async (payload: IUser): Promise<{ user: IUser; token: string }> => {
  const isExist = await User.findOne({ email: payload.email });
  if (isExist) {
    throw new ApiError(400, 'User already exists with this email');
  }

  const result = await User.create(payload);

  const token = jwtHelper.createToken(
    { userId: result._id, role: result.role, email: result.email },
    config.jwt.secret,
    config.jwt.expires_in
  );

  return {
    user: result,
    token,
  };
};

const getAllUsers = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(User.find(), query)
    .search(userSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();

  return {
    meta,
    data: result,
  };
};

const getUserById = async (id: string): Promise<IUser | null> => {
  const result = await User.findById(id);
  if (!result) {
    throw new ApiError(404, 'User not found');
  }
  return result;
};

const updateUser = async (id: string, payload: Partial<IUser>): Promise<IUser | null> => {
  const result = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!result) {
    throw new ApiError(404, 'User not found');
  }
  return result;
};

const deleteUser = async (id: string): Promise<IUser | null> => {
  const result = await User.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(404, 'User not found');
  }
  return result;
};

export const UserService = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
