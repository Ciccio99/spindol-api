import { Router } from 'express';
import DailyReminderServices from '../../services/DailyReminderServices';
import middlwares from '../middlewares';
import { ErrorHandler } from '../../utils/error';

const route = Router();

export default (app) => {
  app.use('/dailyReminders', route);

  route.use(middlwares.auth());

  // get
  route.get('', async (req, res, next) => {
    try {
      const { query } = req;
      query.owner = req.user._id;
      const data = await DailyReminderServices.get(query);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });

  // post
  route.post('', async (req, res, next) => {
    try {
      const dto = req.body;
      dto.owner = req.user._id;
      const data = await DailyReminderServices.insert(dto);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });

  // Patch
  route.patch('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const dto = req.body;
      dto.owner = req.user._id;
      const data = await DailyReminderServices.update(id, dto);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });
};
