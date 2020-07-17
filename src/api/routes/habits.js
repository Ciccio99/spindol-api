import { Router } from 'express';
import HabitServices from '../../services/HabitServices';
import middlewares from '../middlewares';
import xor from '../../utils/xor';
import { ErrorHandler } from '../../utils/error';

const route = Router();

export default (app) => {
  app.use('/habits', route);

  // Middlewares
  route.use(middlewares.auth());

  route.get('', async (req, res, next) => {
    try {
      const { query } = req;
      query.owner = req.user._id;
      if (xor(query.rangeDateStart, query.rangeDateEnd)) {
        throw new ErrorHandler(400, 'When providing a date range, must provide Start date and End ate fo range');
      }
      if (query.rangeDateStart && query.rangeDateEnd) {
        query.$or = [
          { startDate: { $gte: query.rangeDateStart, $lte: query.rangeDateEnd } },
          { endDate: { $gte: query.rangeDateStart, $lte: query.rangeDateEnd } },
          { active: true },
          {
            $and: [
              { startDate: { $lte: query.rangeDateStart } },
              { endDate: { $gte: query.rangeDateEnd } },
            ],
          },
        ];
        // query.startDate = { $gte: query.rangeDateStart, $lte: query.rangeDateEnd };
        delete query.rangeDateStart;
        delete query.rangeDateEnd;
      }
      const data = await HabitServices.get(query);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });

  route.post('', async (req, res, next) => {
    try {
      const dto = req.body;
      dto.owner = req.user._id;
      const data = await HabitServices.insert(dto);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });

  route.post('/upsert', async (req, res, next) => {
    try {
      const dto = req.body;
      dto.owner = req.user._id;
      const data = await HabitServices.upsert(dto);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });

  route.put('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const dto = req.body;
      dto.owner = req.user._id;
      const data = await HabitServices.update(id, dto);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });
};
