import User from '../models/User';

const userLogin = async (userDTO) => {
  const user = await User.findByCredentials(userDTO.email, userDTO.password);
  const token = await user.generateAuthToken();

  return { user, token };
};

const userLogout = async (user, userToken) => {
  user.tokens = await user.tokens.filter((token) => token.token !== userToken);

  await user.save();
};

const userRegister = async (userDTO) => {
  const user = new User({ ...userDTO });
  await user.save();
  const token = await user.generateAuthToken();
  return { user, token };
};

const userEdit = async (user, userDTO) => {
  const allowedUpdates = ['name', 'email', 'password', 'currentPassword', 'confirmPassword'];

  let updates = Object.keys(userDTO);
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    throw new Error(`Invalid update parameters sent. Currently accepting ${allowedUpdates.join(', ')}`);
  }

  if (userDTO.password !== userDTO.confirmPassword) {
    throw new Error('Passwords must match.');
  }

  if (userDTO.password) {
    if (user.checkPassword(userDTO.currentPassword)) {
      throw new Error('Current password is invalid.');
    } else if (user.checkPassword(userDTO.password)) {
      throw new Error('New password cannot match current password.');
    } else {
      updates = updates.filter((update) => update !== 'password' || update !== 'confirmPassword');
    }
  }

  updates.forEach((update) => {
    user[update] = userDTO[update];
  });

  const editedUser = await user.save();

  return editedUser;
};

const userDelete = async (user) => {
  await user.remove();
};

const usersGet = async () => {
  const users = await User.find({ active: true });
  return users;
};

const getUser = async (_id) => {
  const user = await User.findById(_id);
  return user;
};

const setDeviceToken = async (user, device, token) => {
  if (!user) {
    throw new Error('User object is required');
  }
  if (!device) {
    throw new Error('Missing device to save token towards. [oura, withings, fitbit]');
  }

  user.accounts[device].token = { ...token };
  user.accounts[device].connected = true;

  await user.save();
};

export default {
  userLogin,
  userLogout,
  userRegister,
  userEdit,
  userDelete,
  usersGet,
  setDeviceToken,
  getUser,
};
