import { Router } from 'express';
import users from './routes/users';
import sleepTrial from './routes/sleepTrial';
import sleepTrialTracker from './routes/sleepTrialTracker';

// import sleep from './routes/sleep';

export default () => {
  const app = Router();
  users(app);
  sleepTrial(app);
  sleepTrialTracker(app);
  // sleep(app);
  return app;
};
