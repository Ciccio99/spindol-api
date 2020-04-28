import { Router } from 'express';
import { validate } from 'express-validation';
import validationSchemas from '../middlewares/validationSchemas';
import oauth from '../../loaders/oauth';
import config from '../../config';
import { ErrorHandler } from '../../utils/error';

const devices = {
  oura: {
    ...oauth.oura(`${config.baseUrl}/devices/auth-callback/oura`),
  },
};

const route = Router();

export default (app) => {
  app.use('/devices', route);

  app.get('/auth/:device', validate(validationSchemas.paramsDevices), (req, res, next) => {
    const { device } = req.params;
    if (!device || !config.devices.includes(device, 0)) {
      return next(new ErrorHandler(400, `Must include a valid device to authorize: ${config.devices}`));
    }
    return res.redirect(devices[device].authorizationUri);
    // Call to service to get authorizationURI for the correct device
    // Then redirect to that URI
  });

  app.get('/auth-callback/oura', async (req, res, next) => {
    const { code } = req.query;
    const options = {
      code,
    };

    try {
      const result = await devices.oura.oauth2.authorizationCode.getToken(options);

      console.log(`Resulting token: ${result}`);

      const token = devices.oura.oauth2.accessToken.create(result);
      // Here you save the access_token, refresh_token, expires_in
      return res.json(token);
    } catch (error) {
      return next(error);
    }
  });
};
