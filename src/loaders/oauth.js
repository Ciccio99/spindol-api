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
        tokenHost: 'https://api.ouraring.com',
        tokenPath: '/oauth/token',
        authorizeHost: 'https://cloud.ouraring.com',
        authorizePath: '/oauth/authorize',
      },
      options: {
        scopeSeparator: '+',
      },
    });

    const authorizationUri = oauth2.authorizationCode.authorizeURL({
      redirect_uri: redirectUri,
      scope: ['personal', 'daily'],
      state: 'H4etKCeAVXhBdDm5',
    });

    return { oauth2, authorizationUri };
  },
};
