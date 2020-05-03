import User from '../models/User';

export default {

  async getOura(user) {
    return user.accounts.oura.userId;
  },
};
