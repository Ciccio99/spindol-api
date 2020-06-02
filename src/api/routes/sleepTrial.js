import { Router } from 'express';
import { validate } from 'express-validation';
import SleepTrialServices from '../../services/SleepTrialServices';
import validationSchemas from '../middlewares/validationSchemas';
import middlewares from '../middlewares';
import roles from '../../utils/roles';

const route = Router();

/**
 * Create new SleepTrial
 * Get sleepTrial
 * Delete SleepTrial
 * Update sleepTrial
 */
export default (app) => {
  app.use('/sleepTrial', route);

  route.get('', middlewares.auth(), validate(validationSchemas.searchBodyQuery), async (req, res, next) => {
    try {
      const query = JSON.parse(req.query.query);
      const data = await SleepTrialServices.querySleepTrial(query);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });

  route.get('/:id', middlewares.auth(), validate(validationSchemas.paramsId), async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await SleepTrialServices.getSleepTrial(id);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });

  route.post('/create', middlewares.auth(roles.admin), validate(validationSchemas.createSleepTrialSchema), async (req, res, next) => {
    try {
      const dto = { ...req.body };
      const sleepTrial = await SleepTrialServices.createSleepTrial(dto);
      return res.json(sleepTrial);
    } catch (error) {
      return next(error);
    }
  });

  route.delete('/:id', middlewares.auth(roles.admin), validate(validationSchemas.paramsId), async (req, res, next) => {
    try {
      await SleepTrialServices.deleteSleepTrial(req.params.DTO.id);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  });
};
