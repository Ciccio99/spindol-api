import simpleOauth from 'simple-oauth2';
import config from '../config';

export default {
  oura() {
    const redirectUri = `${config.baseUrl}/api/devices/auth/oura/callback`;
    const oauth2 = simpleOauth.create({
      client: {
        id: config.oauth2.oura.client_id,
        secret: config.oauth2.oura.client_secret,
      },
      auth: {
        tokenHost: 'https://api.ouraring.com',
        authorizeHost: 'https://cloud.ouraring.com',
      },
    });

    const authorizationUri = oauth2.authorizationCode.authorizeURL({
      redirect_uri: redirectUri,
      state: 'H4etKCeAVXhBdDm5',
    });

    return { oauth2, authorizationUri, redirectUri };
  },
};
