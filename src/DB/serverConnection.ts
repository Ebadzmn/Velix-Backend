import mongoose from 'mongoose';
import config from '../config';
import { logger, errorLogger } from '../shared/logger';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.database_url as string);
    logger.info('Database connected successfully!');
  } catch (error) {
    errorLogger.error('Failed to connect to database', error);
    process.exit(1);
  }
};
