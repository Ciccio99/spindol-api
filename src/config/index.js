import dotenv from 'dotenv';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();
if (!envFound) {
  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default {
  port: parseInt(process.env.PORT, 10),
  databaseURL: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  authCookieName: process.env.AUTH_COOKIE_NAME,
  baseUrl: process.env.BASE_URL,
  frontEndUri: process.env.FRONT_END_URI,
  logs: {
    level: 'debug',
  },
  api: {
    prefix: '/api',
  },
  oauth2: {
    oura: {
      client_id: process.env.OURA_CLIENT_ID,
      client_secret: process.env.OURA_CLIENT_SECRET,
    },
  },
  devices: ['oura', 'withings', 'fitbit'],

  sendGrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    from: 'alberto@sleepwell.ai',
    templates: {
      inviteUser: 'd-ca101e944c2a4ce98ad2e0af2de37abf',
    },
  },
};
