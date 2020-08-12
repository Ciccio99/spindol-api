import UserUtil from '../utils/user';
import { sgMail, sgClient } from '../loaders/email';
import config from '../config';
import { ErrorHandler } from '../utils/error';
import Logger from '../loaders/logger';

const jwt = require('jsonwebtoken');

const sendRegisterEmail = async (email) => {
  const user = await UserUtil.getUserByEmail(email);
  if (user) {
    throw new ErrorHandler(400, `User (${email}) already exists.`);
  }

  const registerToken = jwt.sign({
    email,
  },
  config.jwtSecret,
  {
    expiresIn: '7d',
  });

  const link = `${config.frontEndUri}/register/${registerToken}`;

  await sgMail.send({
    to: email,
    templateId: config.sendGrid.templates.inviteUser,
    from: {
      email: config.sendGrid.from,
      name: 'Hypnos.ai',
    },
    subject: 'Hypnos.ai Registration',
    dynamicTemplateData: {
      link,
    },
  });
};

const sendWelcomeEmail = async (email, name) => {
  try {
    await sgMail.send({
      to: email,
      templateId: config.sendGrid.templates.welcomeUser,
      from: {
        email: config.sendGrid.from,
        name: 'Hypnos.ai',
      },
      subject: 'Welcome to Hypnos.ai!',
      dynamicTemplateData: {
        name,
      },
    });
  } catch (error) {
    Logger.error(`${error.message} - Stack Trace - ${error.stack}`);
  }
};

const registerMarketingRecipient = async (email, name) => {
  if (!email) {
    throw new Error('No email provided for marketing email registration');
  }

  const data = {
    list_ids: [config.sendGrid.lists.betaRegistration],
    contacts: [{
      email,
      custom_fields: {
        w1_T: name || '',
      },
    }],
  };

  const request = {};
  request.body = data;
  request.method = 'PUT';
  request.url = '/v3/marketing/contacts';

  try {
    await sgClient.request(request);
  } catch (error) {
    Logger.error(`${error.message} - Stack Trace - ${error.stack}`);
  }
};

export default {
  sendRegisterEmail,
  sendWelcomeEmail,
  registerMarketingRecipient,
};
