import sgMail from '@sendgrid/mail';
import sgClient from '@sendgrid/client';
import config from '../config';

sgMail.setApiKey(config.sendGrid.apiKey);
sgClient.setApiKey(config.sendGrid.apiKey);

export { sgMail, sgClient };
