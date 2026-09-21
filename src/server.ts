import chalk from 'chalk';
import { Server } from 'http';
import os from 'os';
import app from './app';
import config from './config';
import { connectDB } from './DB/serverConnection';
import { seedAdmin } from './DB/seedAdmin';
import { socketHelper } from './helpers/socketHelper';
import { errorLogger, logger } from './shared/logger';

let server: Server;

process.on('uncaughtException', (error) => {
  errorLogger.error(`Uncaught Exception: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});

const getNetworkIP = (): string => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const ifaceList = interfaces[name];
    if (ifaceList) {
      for (const iface of ifaceList) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  }
  return '127.0.0.1';
};

async function main() {
  try {
    await connectDB();
    await seedAdmin();

    const networkIp = getNetworkIP();
    const port = Number(config.port) || 5000;

    server = app.listen(port, '0.0.0.0', () => {
      // Print modern terminal banner
      const banner = `
${chalk.cyan('┌─────────────────────────────────────────────────────────────┐')}
${chalk.cyan('│')}  ${chalk.bgCyan.bold.black('                 EXPRESS BACKEND SERVER                      ')} ${chalk.cyan('│')}
${chalk.cyan('├─────────────────────────────────────────────────────────────┤')}
${chalk.cyan('│')}  ${chalk.green('🚀 Mode    :')} ${chalk.bold(config.env.toUpperCase())}
${chalk.cyan('│')}  ${chalk.green('🌐 Port    :')} ${chalk.bold.yellow(port)}
${chalk.cyan('│')}  ${chalk.green('🏠 Local   :')} ${chalk.underline.blue(`http://localhost:${port}`)}
${chalk.cyan('│')}  ${chalk.green('📡 Network :')} ${chalk.underline.green(`http://${networkIp}:${port}`)}
${chalk.cyan('│')}  ${chalk.green('📚 Swagger :')} ${chalk.underline.yellow(`http://localhost:${port}/api-docs`)}
${chalk.cyan('│')}  ${chalk.green('             ')} ${chalk.underline.yellow(`http://${networkIp}:${port}/api-docs`)}
${chalk.cyan('│')}  ${chalk.green('🔌 Socket  :')} ${chalk.bold.magenta('Enabled')}
${chalk.cyan('└─────────────────────────────────────────────────────────────┘')}
      `;
      // eslint-disable-next-line no-console
      console.log(banner);
      logger.info(`Server initialized and listening on:`);
      logger.info(`  - Local:   http://localhost:${port}`);
      logger.info(`  - Network: http://${networkIp}:${port}`);
      logger.info(`Swagger Documentation available at:`);
      logger.info(`  - Local:   http://localhost:${port}/api-docs`);
      logger.info(`  - Network: http://${networkIp}:${port}/api-docs`);
    });

    // Initialize Socket.io
    socketHelper.socket(server);
  } catch (err) {
    errorLogger.error(`Failed to start server: ${err instanceof Error ? err.message : String(err)}`);
  }

  process.on('unhandledRejection', (error) => {
    if (server) {
      server.close(() => {
        errorLogger.error(`Unhandled Rejection: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

main();

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Closing HTTP server gracefully...');
  if (server) {
    server.close();
  }
});
