import dotenv from 'dotenv';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();
if (!envFound) {
  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default {
  authCookieName: process.env.AUTH_COOKIE_NAME,
  api: {
    prefix: '/api',
  },
  baseUrl: process.env.BASE_URL,
  databaseURL: process.env.MONGODB_URI,
  devices: ['oura', 'withings', 'fitbit'],
  frontEndUri: process.env.FRONT_END_URI,
  port: parseInt(process.env.PORT, 10),
  jwtSecret: process.env.JWT_SECRET,
  logs: {
    level: 'debug',
  },
  oauth2: {
    oura: {
      client_id: process.env.OURA_CLIENT_ID,
      client_secret: process.env.OURA_CLIENT_SECRET,
    },
    withings: {
      client_id: process.env.WITHINGS_CLIENT_ID,
      client_secret: process.env.WITHINGS_CLIENT_SECRET,
    },
  },
  register: {
    mode: 'open',
  },
  sendGrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    from: 'support@spindol.com',
    templates: {
      inviteUser: 'd-ca101e944c2a4ce98ad2e0af2de37abf',
      welcomeUser: 'd-f167858aacee4e36b91c7c086428d4a3',
    },
    lists: {
      registeredUsers: process.env.SENDGRID_REGISTERED_USER_LIST,
      betaRegistration: 'a1834fbb-a213-4a59-8f23-701243771a2c',
      testRegistration: '67c03e68-4794-499c-b483-b1a5daf0b4c0',
    },
    unsubscribeGroups: {
      transactional: 15601,
      updates: 15583,
      marketing: 15582,
      dailyReminder: 15581,
    },
  },
  stripe: {
    api_key: process.env.STRIPE_API_KEY,
    signing_secret: process.env.STRIPE_SIGNING_SECRET,
    env: process.env.STRIPE_ENV,
  },
};
