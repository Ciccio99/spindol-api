import { Router } from 'express';
import users from './routes/users';
// import sleep from './routes/sleep';

export default () => {
  const app = Router();
  users(app);
  // sleep(app);
  return app;
};
