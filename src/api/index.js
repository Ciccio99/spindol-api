import { Router } from 'express';
import users from './routes/users';
import sleepTrial from './routes/sleepTrial';
import sleepTrialTracker from './routes/sleepTrialTracker';
import dailyDiary from './routes/dailyDiary';
import devices from './routes/devices';
import sleepSummary from './routes/sleepSummary';
import habits from './routes/habits';
import dailyReminders from './routes/dailyReminders';
import admin from './routes/admin';
import tags from './routes/tags';
import plans from './routes/plans';
import stripeWebhooks from './routes/stripe-webhooks';

export default () => {
  const app = Router();

  users(app);
  sleepTrial(app);
  sleepTrialTracker(app);
  dailyDiary(app);
  sleepSummary(app);
  habits(app);
  devices(app);
  dailyReminders(app);
  tags(app);
  plans(app);
  stripeWebhooks(app);
  admin(app);

  return app;
};
