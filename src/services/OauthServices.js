import oauth from '../loaders/oauth';
import UserServices from './UserServices';

const refreshDeviceToken = async (user, device) => {
  if (!user) {
    throw new Error('User object is required');
  }
  if (!device) {
    throw new Error('Missing device to save token towards. [oura, withings, fitbit]');
  }

  const EXPIRATION_WINDOW_IN_SECONDS = 300;

  const deviceOauth = oauth[device]();
  let token = deviceOauth.oauth2.accessToken.create({ ...user.accounts[device].token });

  if (token.expired(EXPIRATION_WINDOW_IN_SECONDS)) {
    try {
      token = await token.refresh();

      await UserServices.setDeviceToken(user, device, { ...token.token });
    } catch (error) {
      throw new Error(error);
    }
  }
};

export default {
  refreshDeviceToken,
};
