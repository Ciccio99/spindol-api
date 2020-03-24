import { ObjectId } from 'mongodb';

const authSleep = async (req, res, next) => {
  try {
    const userObjectId = new ObjectId(req.params.user);


    if (req.user.role === 'coach' || req.user._id.equals(userObjectId)) {
      return next();
    }
    const error = new Error('Unauthorized');
    error.status = 401;

    return next(error);
  } catch (error) {
    return next(error);
  }
};

export default authSleep;
