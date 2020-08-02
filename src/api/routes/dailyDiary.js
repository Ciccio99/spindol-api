import { Router } from 'express';
import { validate } from 'express-validation';
import DailyDiaryServices from '../../services/DailyDiaryServices';
import validationSchemas from '../middlewares/validationSchemas';
import middlewares from '../middlewares';
import { ErrorHandler } from '../../utils/error';

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

  route.patch('/:id', middlewares.auth(), validate(validationSchemas.patchDailyDiary, { context: true }), async (req, res, next) => {
    try {
      const { id } = req.params;
      const dto = req.body;
      dto.owner = req.user._id;
      const data = await DailyDiaryServices.update(dto, id);
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

  route.post('/:id/tags', middlewares.auth(), validate(validationSchemas.dailyDiaryTags, { context: true }), async (req, res, next) => {
    try {
      const { id } = req.params;
      const { tags } = req.body;
      if (!tags || tags.length === 0) {
        throw new ErrorHandler(400, 'Must provide tags.');
      }
      const currTags = await DailyDiaryServices.insertTags(tags, id);
      return res.json({ tags: currTags });
    } catch (error) {
      return next(error);
    }
  });

  route.delete('/:id/tags', middlewares.auth(), validate(validationSchemas.dailyDiaryTags, { context: true }), async (req, res, next) => {
    try {
      const { id } = req.params;
      const { tags } = req.body;
      if (!tags || tags.length === 0) {
        throw new ErrorHandler(400, 'Must provide tags.');
      }
      const currTags = await DailyDiaryServices.removeTags(tags, id);
      return res.json({ tags: currTags });
    } catch (error) {
      return next(error);
    }
  });
};
