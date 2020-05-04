import { Router } from 'express';
import { validate } from 'express-validation';
import SleepTrialTrackerServices from '../../services/SleepTrialTrackerServices';
import validationSchemas from '../middlewares/validationSchemas';
import middlewares from '../middlewares';

const route = Router();

/**
 * Create new SleepTrial
 * Get sleepTrial
 * Delete SleepTrial
 * Update sleepTrial
 */
export default (app) => {
  app.use('/sleepTrialTracker', route);

  route.get('', middlewares.auth, validate(validationSchemas.searchBodyQuery), async (req, res, next) => {
    try {
      const query = JSON.parse(req.query.query);
      const data = await SleepTrialTrackerServices.querySleepTrialTracker(query);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });

  route.get('/:id', middlewares.auth, validate(validationSchemas.paramsId), async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await SleepTrialTrackerServices.getSleepTrialTracker(id);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });

  route.post('/create', middlewares.auth, validate(validationSchemas.createSleepTrialTracker), async (req, res, next) => {
    try {
      const data = await SleepTrialTrackerServices.createSleepTrialTracker(req.body);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });

  route.post('/add/checkIn', middlewares.auth, validate(validationSchemas.checkIn), async (req, res, next) => {
    try {
      const data = await SleepTrialTrackerServices.upsertCheckIn(req.body);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });

  route.post('/update', middlewares.auth, validate(validationSchemas.updateSleepTrialTracker), async (req, res, next) => {
    try {
      const data = await SleepTrialTrackerServices.updateSleepTrialTracker(req.body);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });
};
