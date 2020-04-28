import { Router } from 'express';
import { validate } from 'express-validation';
import validationSchemas from '../middlewares/validationSchemas';
import SleepSummaryServices from '../../services/SleepSummaryServices';

const route = Router();

/**
 * Create SleepSummary
 * Get SleepSummary by ID
 * Query Sleep Summary
 * Update SleepSummary
 */
export default (app) => {
  app.use('/sleepSummary', route);

  route.get('', validate(validationSchemas.searchBodyQuery), async (req, res, next) => {
    try {
      const query = req.body;
      const data = await SleepSummaryServices.query(query);
      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  });

  route.get('/:id', validate(validationSchemas.paramsId), async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await SleepSummaryServices.getById(id);
      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  });

  route.post('/create', validate(validationSchemas.sleepSummaryCreate), async (req, res, next) => {
    try {
      const data = await SleepSummaryServices.create(req.body);
      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  });

  route.post('/update', validate(validationSchemas.sleepSummaryUpdate), async (req, res, next) => {
    try {
      const data = await SleepSummaryServices.update(req.body);
      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  });
};
