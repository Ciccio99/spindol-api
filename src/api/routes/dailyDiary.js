import { Router } from 'express';
import { validate } from 'express-validation';
import DailyDiaryServices from '../../services/DailyDiaryServices';
import validationSchemas from '../middlewares/validationSchemas';

const route = Router();

export default (app) => {
  app.use('/dailyDiary', route);

  route.get('', validate(validationSchemas.searchBodyQuery), async (req, res, next) => {
    try {
      const query = JSON.parse(req.query.query);
      const data = await DailyDiaryServices.query(query);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });

  route.get('/:id', validate(validationSchemas.paramsId), async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await DailyDiaryServices.getById(id);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });

  route.post('/create', validate(validationSchemas.createDailyDiary), async (req, res, next) => {
    try {
      const data = await DailyDiaryServices.create(req.body);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });

  route.post('/update', validate(validationSchemas.updateDailyDiary), async (req, res, next) => {
    try {
      const data = await DailyDiaryServices.update(req.body);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });

  route.post('/upsert', validate(validationSchemas.createDailyDiary), async (req, res, next) => {
    try {
      const data = await DailyDiaryServices.upsert(req.body);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });
};
