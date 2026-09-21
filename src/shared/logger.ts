import chalk from 'chalk';
import path from 'path';
import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf } = format;

// Console log format with custom colors & icons
const consoleFormat = printf(({ level, message, timestamp }) => {
  const timeStr = chalk.gray(`[${timestamp}]`);

  let levelBadge = '';
  switch (level.toLowerCase()) {
    case 'info':
      levelBadge = chalk.bgBlue.bold.white(' INFO ') + ' ' + chalk.blue('ℹ️');
      break;
    case 'error':
      levelBadge = chalk.bgRed.bold.white(' ERROR ') + ' ' + chalk.red('❌');
      break;
    case 'warn':
      levelBadge = chalk.bgYellow.bold.black(' WARN ') + ' ' + chalk.yellow('⚠️');
      break;
    case 'success':
      levelBadge = chalk.bgGreen.bold.black(' SUCCESS ') + ' ' + chalk.green('🚀');
      break;
    default:
      levelBadge = chalk.bgCyan.bold.black(` ${level.toUpperCase()} `);
  }

  const formattedMsg =
    typeof message === 'object' ? JSON.stringify(message, null, 2) : message;

  return `${timeStr} ${levelBadge} ${formattedMsg}`;
});

// File log format (plain text for clean file saving)
const fileFormat = printf(({ level, message, timestamp }) => {
  const formattedMsg =
    typeof message === 'object' ? JSON.stringify(message, null, 2) : message;
  return `[${timestamp}] [${level.toUpperCase()}]: ${formattedMsg}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    consoleFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: path.join(process.cwd(), 'logs', 'winston', 'successes', 'success.log'),
      level: 'info',
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        fileFormat
      ),
    }),
  ],
});

const errorLogger = createLogger({
  level: 'error',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    consoleFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: path.join(process.cwd(), 'logs', 'winston', 'errors', 'error.log'),
      level: 'error',
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        fileFormat
      ),
    }),
  ],
});

export { errorLogger, logger };
