import validator from 'validator';
import { ErrorHandler } from '../../../utils/error';

const userLogin = async (req, res, next) => {
  try {
    if (!validator.isEmail(req.body.email)) {
      throw new ErrorHandler(400, 'Invalid Email');
    }

    req.userDTO = {
      email: req.body.email,
      password: req.body.password,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

export default userLogin;
