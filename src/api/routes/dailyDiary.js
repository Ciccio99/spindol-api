import { Router } from 'express';
import { validate } from 'express-validation';
import DailyDiaryServices from '../../services/DailyDiaryServices';
import validationSchemas from '../middlewares/validationSchemas';
import middlewares from '../middlewares';

const route = Router();

export default (app) => {
  app.use('/dailyDiary', route);

  route.get('', middlewares.auth(), validate(validationSchemas.searchBodyQuery), async (req, res, next) => {
    try {
      const query = JSON.parse(req.query.query);
      const data = await DailyDiaryServices.query(query, req.user);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });

  route.get('/getByDate', middlewares.auth(), async (req, res, next) => {
    try {
      const query = JSON.parse(req.query.query);
      const data = await DailyDiaryServices.getsertByDate(query.date, req.user);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });

  route.get('/reportingStreak', middlewares.auth(), async (req, res, next) => {
    try {
      const streak = await DailyDiaryServices.getReportingStreak(req.user);
      return res.json({ streak });
    } catch (error) {
      return next(error);
    }
  });

  route.get('/:id', middlewares.auth(), validate(validationSchemas.paramsId), async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await DailyDiaryServices.getById(id, req.user);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });

  route.post('/create', middlewares.auth(), validate(validationSchemas.createDailyDiary), async (req, res, next) => {
    try {
      const data = await DailyDiaryServices.create(req.body, req.user);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });

  route.post('/update', middlewares.auth(), validate(validationSchemas.updateDailyDiary), async (req, res, next) => {
    try {
      const data = await DailyDiaryServices.update(req.body, req.user);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });

  route.post('/upsert', middlewares.auth(), validate(validationSchemas.createDailyDiary), async (req, res, next) => {
    try {
      const data = await DailyDiaryServices.upsert(req.body, req.user);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });
};
