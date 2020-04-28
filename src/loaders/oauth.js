import simpleOauth from 'simple-oauth2';
import config from '../config';

export default {
  oura(redirectUri) {
    const oauth2 = simpleOauth.create({
      client: {
        id: config.oauth2.oura.client_id,
        secret: config.oauth2.oura.client_secret,
      },
      auth: {
        tokenHost: 'https://cloud.ouraring.com',
        tokenPath: '/oauth/token',
        authorizePath: '/oauth/authorize',
      },
      options: {
        scopeSeparator: '+',
      },
    });
    const authorizationUri = oauth2.authorizationCode.authorizeURL({
      redirect_uri: redirectUri,
      scope: ['personal', 'daily'],
      state: '8$)9*@#64={&25%',
    });

    return { oauth2, authorizationUri };
  },
};
