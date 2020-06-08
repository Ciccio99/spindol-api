import UserServices from './UserServices';
import sgMail from '../loaders/email';
import config from '../config';
import { ErrorHandler } from '../utils/error';

const jwt = require('jsonwebtoken');

const sendRegisterEmail = async (email) => {
  const user = await UserServices.getUserByEmail(email);
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

  sgMail.send({
    to: email,
    templateId: config.sendGrid.templates.inviteUser,
    from: config.sendGrid.from,
    subject: 'Hypnos.ai Registration',
    dynamicTemplateData: {
      link,
    },
  });

  // sgMail.send({
  //   to: email,
  //   from: 'alberto@sleepwell.ai',
  //   subject: 'Hypnos.ai Registration',
  //   text: `Welcome to Hypnos.ai!
  //       \nPlease follow the provided link to complete the registration process:
  //       \n${link}\n
  //       \n\n\n Cheers,
  //       \nHypnos.ai Team`,
  // });
};

export default {
  sendRegisterEmail,
};
