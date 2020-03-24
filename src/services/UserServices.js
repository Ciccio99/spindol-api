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
  const updates = Object.keys(userDTO);
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

export default {
  userLogin,
  userLogout,
  userRegister,
  userEdit,
  userDelete,
  usersGet,
};
