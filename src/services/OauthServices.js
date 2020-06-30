import oauth from '../loaders/oauth';
import UserServices from './UserServices';
import config from '../config';

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

// TODO: Investigate why Authroisation is not allowed for revoking all. Is Oura not Oauth2.0
// THere is an issue on github talking about: https://github.com/lelylan/simple-oauth2/issues/106
// const token = devices.oura.oauth2.accessToken.create({ ...req.user.accounts.oura.token });
// await token.revokeAll();
const revokeDeviceToken = async (user, device) => {
  if (!user) {
    throw new Error('User object is required');
  }
  if (!device) {
    throw new Error('Missing device to save token towards. [oura, withings, fitbit]');
  }
  if (!config.devices.includes(device)) {
    throw new Error(`Must include a proper device name: ${config.devices}`);
  }

  user.accounts[device].token = {};
  user.accounts[device].connected = false;
  await user.save();
};

export default {
  refreshDeviceToken,
  revokeDeviceToken,
};
