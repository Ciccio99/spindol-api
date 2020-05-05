import { ErrorHandler } from '../../../utils/error';

const { ObjectId } = require('mongoose').Types;

const paramsId = (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
      throw new ErrorHandler(400, 'Invalid Params: Invalid User ID');
    }
    req.DTO = { id };

    return next();
  } catch (error) {
    return next(error);
  }
};

export default paramsId;
