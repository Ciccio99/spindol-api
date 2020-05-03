import { Router } from 'express';
import { validate } from 'express-validation';
import DeviceServices from '../../services/DeviceServices';
import validationSchemas from '../middlewares/validationSchemas';
import oauth from '../../loaders/oauth';
import config from '../../config';
import { ErrorHandler } from '../../utils/error';
import Logger from '../../loaders/logger';

const devices = {
  oura: {
    ...oauth.oura(`${config.baseUrl}/api/devices/auth/oura/callback`),
  },
};

const route = Router();

export default (app) => {
  app.use('/devices', route);

  route.get('/:devices', async (req, res, next) => {
    try {
      switch (req.params.devices) {
        case 'oura':
          return res.json(DeviceServices.getOura(req.user));
        default:
          return res.json();
      }
    } catch (error) {
      return next(error);
    }
  });

  route.get('/redirectUri/:device', validate(validationSchemas.paramsDevices), (req, res, next) => {
    const { device } = req.params;
    console.log(device);
    if (!device || !config.devices.includes(device, 0)) {
      return next(new ErrorHandler(400, `Must include a valid device to authorize: ${config.devices}`));
    }
    return res.json(`${config.baseUrl}/api/devices/auth/oura`);
  });

  /**
   * ~~~~~~~~~~~~~~~~~~~~~
   * Oauth Oura
   * ~~~~~~~~~~~~~~~~~~~~~
   */

  route.get('/auth/oura', (req, res, next) => {
    res.redirect(devices.oura.authorizationUri);
  });

  route.get('/auth/oura/callback', async (req, res, next) => {
    console.log('IN CALLBACK');
    const { code } = req.query;
    const options = { code };

    try {
      const result = await devices.oura.oauth2.authorizationCode.getToken(options);
      console.log(result);

      const token = devices.oura.oauth2.accessToken.create(result);

      res.redirect(`${config.frontEndUri}/settings`);
    } catch (error) {
      Logger.warn(error);
      res.redirect(`${config.frontEndUri}/settings`);
    }
  });
};
