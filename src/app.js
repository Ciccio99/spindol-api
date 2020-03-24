import express from 'express';
import config from './config';
import loaders from './loaders';
import Logger from './loaders/logger';

const startServer = async () => {
  const app = express();

  await loaders({ expressApp: app });

  app.listen(config.port, (err) => {
    if (err) {
      Logger.error(err);
      process.exit(1);
    }
    Logger.info(`🛡️  Server listening on port: ${config.port} 🛡️`);
  });
};

startServer();
