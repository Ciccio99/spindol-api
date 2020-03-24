import validator from 'validator';
import User from '../../../models/User';
import { ErrorHandler } from '../../../utils/error';

const userRegister = async (req, res, next) => {
  try {
    if (!validator.isEmail(req.body.email)) {
      throw new ErrorHandler(400, 'Invalid Email');
    }
    if (req.body.password !== req.body.passwordConfirm) {
      throw new ErrorHandler(400, 'Passwords do not match');
    }
    const duplicate = await User.findOne({ email: req.body.email });
    if (duplicate) {
      throw new ErrorHandler(400, 'This email is already taken');
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

export default userRegister;
