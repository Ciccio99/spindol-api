import oauth from '../loaders/oauth';

const refreshDeviceToken = async (user, device) => {
  if (!user) {
    throw new Error('User object is required');
  }
  if (!device) {
    throw new Error('Missing device to save token towards. [oura, withings, fitbit]');
  }

  const EXPIRATION_WINDOW_IN_SECONDS = 300;

  const ouraOauth = oauth.oura();
  let token = ouraOauth.oauth2.accessToken.create({ ...user.accounts[device].token });
  if (token.expired(EXPIRATION_WINDOW_IN_SECONDS)) {
    try {
      token = await token.refresh();
    } catch (error) {
      throw new Error(`Error refreshing access token: ${error.message}`);
    }
  }
};

export default {
  refreshDeviceToken,
};
