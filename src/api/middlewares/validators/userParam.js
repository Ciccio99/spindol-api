import { ErrorHandler } from '../../../utils/error';

const { ObjectId } = require('mongoose').Types;

const userParam = (req, res, next) => {
  try {
    const userId = req.params.user;
    if (!userId || !ObjectId.isValid(userId)) {
      throw new ErrorHandler(400, 'Invalid Params: Invalid User ID');
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

export default userParam;
