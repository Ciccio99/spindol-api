import Moment from 'moment';
import { ErrorHandler } from '../../../utils/error';

const dateQuery = (req, res, next) => {
  try {
    if (!req.query.date) {
      throw new ErrorHandler(400, 'Invalid Query: Must have date query');
    }

    const dateArr = req.query.date.split('-');
    if (dateArr.length !== 3) {
      throw new ErrorHandler(401, 'Invalid Query: Invalid Date provided. Must be in format (YYYY-MM-DD)');
    }

    const date = new Moment(req.query.date);
    if (!date.valueOf()) {
      throw new ErrorHandler(401, 'Invalid Query: Invalid Date provided. Must be in format (YYYY-MM-DD)');
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

export default dateQuery;
