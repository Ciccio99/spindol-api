import { ErrorHandler } from '../../../utils/error';

const userEdit = async (req, res, next) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'currentPassword'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
      throw new ErrorHandler(400, 'Invalid Parameters');
    }

    if (req.body.currentPassword || req.body.password) {
      if (req.body.currentPassword && req.body.password) {
        if (await req.user.checkPassword(req.body.currentPassword)) {
          if (req.body.currentPassword === req.body.password) {
            throw new ErrorHandler(400, 'New Password cannot be the same as Current Password.');
          }
          const index = updates.indexOf('currentPassword');
          updates.splice(index, 1);
        }
      } else {
        throw new ErrorHandler(400, 'Must provide both Current Password and New Password.');
      }
    }
    req.userDTO = {};
    updates.forEach((update) => {
      if (req.body[update]) {
        req.userDTO[update] = req.body[update];
      }
    });

    return next();
  } catch (error) {
    return next(error);
  }
};

export default userEdit;
