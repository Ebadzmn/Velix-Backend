import config from '../config';
import { ENUM_USER_ROLE } from '../enums/user';
import { User } from '../app/modules/user/user.model';
import { logger } from '../shared/logger';

export const seedAdmin = async (): Promise<void> => {
  const isAdminExist = await User.findOne({ role: ENUM_USER_ROLE.SUPER_ADMIN });
  if (!isAdminExist) {
    await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      name: 'Super Admin',
      email: config.admin.email,
      password: config.admin.password,
      role: ENUM_USER_ROLE.SUPER_ADMIN,
      status: 'active',
    });
    logger.info('Super Admin seeded successfully!');
  }
};
