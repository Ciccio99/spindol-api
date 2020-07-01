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

    return { oauth2, redirectUri };
  },
  withings() {
    const redirectUri = `${config.baseUrl}/api/devices/auth/withings/callback`;
    const oauth2 = simpleOauth.create({
      client: {
        id: config.oauth2.withings.client_id,
        secret: config.oauth2.withings.client_secret,
      },
      auth: {
        authorizeHost: 'https://account.withings.com',
        authorizePath: '/oauth2_user/authorize2',
        tokenHost: 'https://account.withings.com',
        tokenPath: '/oauth2/token',
      },
      options: {
        bodyFormat: 'form',
        authorizationMethod: 'body',
      },
    });
    const scope = 'user.sleepevents,user.activity';

    return { oauth2, redirectUri, scope };
  },
};
