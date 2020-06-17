import User from '../models/User';

const getUserByEmail = async (email) => {
  const user = await User.findOne({ email });
  return user;
};

export default {
  getUserByEmail,
};
