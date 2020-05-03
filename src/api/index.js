import { Router } from 'express';
import users from './routes/users';
import sleepTrial from './routes/sleepTrial';
import sleepTrialTracker from './routes/sleepTrialTracker';
import dailyDiary from './routes/dailyDiary';
import devices from './routes/devices';
import sleepSummary from './routes/sleepSummary';

export default () => {
  const app = Router();
  users(app);
  sleepTrial(app);
  sleepTrialTracker(app);
  dailyDiary(app);
  sleepSummary(app);
  devices(app);

  return app;
};
