import { Router } from 'express';
import { validate } from 'express-validation';
import SleepTrialServices from '../../services/SleepTrialServices';
import validationSchemas from '../middlewares/validationSchemas';


const route = Router();

/**
 * Create new SleepTrial
 * Get sleepTrial
 * Delete SleepTrial
 * Update sleepTrial
 */
export default (app) => {
  app.use('/sleepTrial', route);

  route.get('', validate(validationSchemas.searchBodyQuery), async (req, res, next) => {
    try {
      const query = req.body;
      const data = await SleepTrialServices.querySleepTrial(query);
      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  });

  route.get('/:id', validate(validationSchemas.paramsId), async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await SleepTrialServices.getSleepTrial(id);
      return res.json({ data });
    } catch (error) {
      return next(error);
    }
  });

  route.post('/create', validate(validationSchemas.createSleepTrialSchema), async (req, res, next) => {
    try {
      const dto = { ...req.body };
      const sleepTrial = await SleepTrialServices.createSleepTrial(dto);
      return res.json({ data: sleepTrial });
    } catch (error) {
      return next(error);
    }
  });

  route.delete('/:id', validate(validationSchemas.paramsId), async (req, res, next) => {
    try {
      await SleepTrialServices.deleteSleepTrial(req.params.DTO.id);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  });
};
