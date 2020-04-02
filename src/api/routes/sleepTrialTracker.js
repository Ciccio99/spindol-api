import { Router } from 'express';
import { validate } from 'express-validation';
import SleepTrialTrackerServices from '../../services/SleepTrialTrackerServices';
import validationSchemas from '../middlewares/validationSchemas';

const route = Router();

/**
 * Create new SleepTrial
 * Get sleepTrial
 * Delete SleepTrial
 * Update sleepTrial
 */
export default (app) => {
  app.use('/sleepTrialTracker', route);

  route.get('', validate(validationSchemas.searchBodyQuery), async (req, res, next) => {
    try {
      const query = req.body;
      const data = await SleepTrialTrackerServices.querySleepTrialTracker(query);
      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  });

  route.get('/:id', validate(validationSchemas.paramsId), async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await SleepTrialTrackerServices.getSleepTrialTracker(id);
      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  });

  route.post('/create', validate(validationSchemas.createSleepTrialTracker), async (req, res, next) => {
    try {
      const data = await SleepTrialTrackerServices.createSleepTrialTracker(req.body);
      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  });

  route.post('/add/checkIn', validate(validationSchemas.checkIn), async (req, res, next) => {
    try {
      const data = await SleepTrialTrackerServices.upsertCheckIn(req.body);
      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  });

  route.post('/update', validate(validationSchemas.updateSleepTrialTracker), async (req, res, next) => {
    try {
      const data = await SleepTrialTrackerServices.updateSleepTrialTracker(req.body);
      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  });

};
