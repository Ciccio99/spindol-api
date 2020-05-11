import { Router } from 'express';
import { validate } from 'express-validation';
import validationSchemas from '../middlewares/validationSchemas';
import SleepSummaryServices from '../../services/SleepSummaryServices';
import middlewares from '../middlewares';

const route = Router();

/**
 * Create SleepSummary
 * Get SleepSummary by ID
 * Query Sleep Summary
 * Update SleepSummary
 */
export default (app) => {
  app.use('/sleepSummary', route);

  route.get('', middlewares.auth, validate(validationSchemas.searchBodyQuery), async (req, res, next) => {
    try {
      let query = {};
      if (req.query.query) {
        query = JSON.parse(req.query.query);
      }
      const data = await SleepSummaryServices.query(query, req.user);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });

  route.get('/:id', middlewares.auth, validate(validationSchemas.paramsId), async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await SleepSummaryServices.getById(id, req.user);
      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  });

  route.post('/create', middlewares.auth, validate(validationSchemas.sleepSummaryCreate), async (req, res, next) => {
    try {
      const data = await SleepSummaryServices.create(req.body, req.user);
      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  });

  route.post('/update', middlewares.auth, validate(validationSchemas.sleepSummaryUpdate), async (req, res, next) => {
    try {
      const data = await SleepSummaryServices.update(req.body, req.user);
      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  });
};
