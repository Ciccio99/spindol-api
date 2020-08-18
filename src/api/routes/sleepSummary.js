import { Router } from 'express';
import { validate } from 'express-validation';
import validationSchemas from '../middlewares/validationSchemas';
import SleepSummaryServices from '../../services/SleepSummaryServices';
import middlewares from '../middlewares';
import SleepSummaryUtils from '../../utils/sleepSummary';
import Roles from '../../utils/roles';
import xor from '../../utils/xor';
import { ErrorHandler } from '../../utils/error';

const route = Router();

/**
 * Create SleepSummary
 * Get SleepSummary by ID
 * Query Sleep Summary
 * Update SleepSummary
 */
export default (app) => {
  app.use('/sleepSummary', route);

  route.get('', middlewares.auth(), validate(validationSchemas.searchBodyQuery), async (req, res, next) => {
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

  // TODO: This is a temporary route for testing, ideally this will be refactored
  // into a better permissions architecture
  route.get('/teams', middlewares.auth(Roles.admin), async (req, res, next) => {
    try {
      const { query } = req;
      if (xor(query.rangeDateStart, query.rangeDateEnd)) {
        throw new ErrorHandler(400, 'When providing a date range, must provide Start date and End ate fo range');
      }
      if (query.rangeDateStart && query.rangeDateEnd) {
        query.date = {
          $gte: query.rangeDateStart,
          $lte: query.rangeDateEnd,
        };
        delete query.rangeDateStart;
        delete query.rangeDateEnd;
      }
      const data = await SleepSummaryServices.get(query);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });

  route.get('/fatigueScore', middlewares.auth(), validate(validationSchemas.getFatigueScore), async (req, res, next) => {
    try {
      const fatigueScore = await SleepSummaryUtils.getFatigueScore(req.query.date, req.user);
      return res.json({ fatigueScore });
    } catch (error) {
      return next(error);
    }
  });

  route.get('/tags', middlewares.auth(), async (req, res, next) => {
    try {
      const { startDate, endDate, tags } = req.query;
      const data = await SleepSummaryServices.getTagsSleepData(startDate, endDate, tags);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });

  route.get('/:id', middlewares.auth(), validate(validationSchemas.paramsId), async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await SleepSummaryServices.getById(id, req.user);
      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  });

  route.post('/create', middlewares.auth(), validate(validationSchemas.sleepSummaryCreate), async (req, res, next) => {
    try {
      const data = await SleepSummaryServices.create(req.body, req.user);
      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  });

  route.post('/update', middlewares.auth(), validate(validationSchemas.sleepSummaryUpdate), async (req, res, next) => {
    try {
      const data = await SleepSummaryServices.update(req.body, req.user);
      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  });
};
