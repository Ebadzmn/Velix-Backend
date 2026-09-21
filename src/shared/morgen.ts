import chalk from 'chalk';
import { Request, Response } from 'express';
import morgan from 'morgan';
import { logger } from './logger';

// Custom tokens for clean URL and response logging
morgan.token('clean-method', (req: Request) => req.method || 'GET');
morgan.token('clean-url', (req: Request) => req.originalUrl || req.url);

export const MorganSuccessHandler = morgan(
  (tokens, req: Request, res: Response) => {
    const method = tokens['clean-method'](req, res);
    const url = tokens['clean-url'](req, res);
    const status = res.statusCode;
    const responseTime = tokens['response-time'](req, res);

    const methodFormatted = chalk.bold.green(`[${method}]`);
    const urlFormatted = chalk.bold.white(url);
    const statusFormatted = chalk.bold.green(`${status} OK`);
    const timeFormatted = chalk.gray(`(${responseTime}ms)`);

    return `${methodFormatted} ${urlFormatted} ──> ${statusFormatted} ${timeFormatted}`;
  },
  {
    skip: (req: Request, res: Response) => res.statusCode >= 400,
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  }
);

export const MorganErrorHandler = morgan(
  (tokens, req: Request, res: Response) => {
    const method = tokens['clean-method'](req, res);
    const url = tokens['clean-url'](req, res);
    const status = res.statusCode;
    const responseTime = tokens['response-time'](req, res);

    const methodFormatted = chalk.bold.red(`[${method}]`);
    const urlFormatted = chalk.bold.white(url);
    const statusFormatted = chalk.bold.red(`${status} Error`);
    const timeFormatted = chalk.gray(`(${responseTime}ms)`);

    return `${methodFormatted} ${urlFormatted} ──> ${statusFormatted} ${timeFormatted}`;
  },
  {
    skip: (req: Request, res: Response) => res.statusCode < 400,
    stream: {
      write: (message: string) => logger.error(message.trim()),
    },
  }
);
