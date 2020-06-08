import expressLoader from './express';
import mongooseLoader from './mongoose';
import Logger from './logger';

export default async ({ expressApp }) => {
  try {
    await mongooseLoader();
    Logger.info('✌️ DB loaded and connected!');
  } catch (error) {
    Logger.error('MongoDB failed to load');
    Logger.error(error);
  }

  await expressLoader({ app: expressApp });
  Logger.info('✌️ Express loaded!');
};
