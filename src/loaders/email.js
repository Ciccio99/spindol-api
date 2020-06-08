import sgMail from '@sendgrid/mail';
import config from '../config';

sgMail.setApiKey(config.sendGrid.apiKey);

export default sgMail;
