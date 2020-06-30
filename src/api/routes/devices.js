import { Router } from 'express';
import { validate } from 'express-validation';
import validationSchemas from '../middlewares/validationSchemas';
import oauth from '../../loaders/oauth';
import config from '../../config';
import { ErrorHandler } from '../../utils/error';
import Logger from '../../loaders/logger';
import UserServices from '../../services/UserServices';
import OuraServices from '../../services/OuraServices';
import OauthServices from '../../services/OauthServices';
import WithingsServices from '../../services/WithingsServices';
import middlewares from '../middlewares';

const jwt = require('jsonwebtoken');

const devices = {
  oura: {
    ...oauth.oura(),
  },
  withings: {
    ...oauth.withings(),
  },
};

const route = Router();

export default (app) => {
  app.use('/devices', route);

  route.get('/redirectUri/:device', middlewares.auth(), validate(validationSchemas.paramsDevices), (req, res, next) => {
    const { device } = req.params;
    if (!device || !config.devices.includes(device, 0)) {
      return next(new ErrorHandler(400, `Must include a valid device to authorize: ${config.devices}`));
    }
    const authorizationUri = devices[device].oauth2.authorizationCode.authorizeURL({
      redirect_uri: devices[device].redirectUri,
      state: jwt.sign({ _id: req.user._id.toString() }, process.env.JWT_SECRET),
    });
    return res.json(authorizationUri);
  });


  /**
   * ~~~~~~~~~~~~~~~~~~~~~
   * Sync Sleep per Device
   * ~~~~~~~~~~~~~~~~~~~~~
   */

  route.get('/sync/oura', middlewares.auth(), async (req, res, next) => {
    try {
      await OuraServices.syncSleepSummary(req.user);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  });

  /**
   * ~~~~~~~~~~~~~~~~~~~~~
   * Oauth Oura
   * ~~~~~~~~~~~~~~~~~~~~~
   */

  route.get('/auth/oura/revoke', middlewares.auth(), async (req, res, next) => {
    try {
      await OauthServices.revokeDeviceToken('oura');
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  });

  route.get('/auth/oura/callback', async (req, res, next) => {
    const { code, state } = req.query;
    const options = { code, redirect_uri: devices.oura.redirectUri };

    try {
      const decoded = jwt.verify(state, process.env.JWT_SECRET);
      const user = await UserServices.getUser(decoded._id);
      if (!user) {
        throw new Error('No user ID provided in auth/oura/callback JWT state');
      }
      const result = await devices.oura.oauth2.authorizationCode.getToken(options);
      const token = devices.oura.oauth2.accessToken.create(result);

      if (user.accounts.withings.connected) {
        await OauthServices.revokeDeviceToken(user, 'withings');
      }
      await UserServices.setDeviceToken(user, 'oura', { ...token.token });

      // Sync Data asynchronously
      OuraServices.syncSleepSummary(user);

      res.redirect(`${config.frontEndUri}/settings`);
    } catch (error) {
      Logger.error(error);
      res.redirect(`${config.frontEndUri}/settings`);
    }
  });

  /**
   * ~~~~~~~~~~~~~~~~~~~~~
   * Oauth Withings
   * ~~~~~~~~~~~~~~~~~~~~~
   */

  // Test get SleepSummary from Withings
  route.get('/test/withings/getSleepSummary', middlewares.auth(), async (req, res, next) => {
    try {
      const data = await WithingsServices.getSleepSummary(req.user, req.date || '2020-06-25');
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });

  route.get('/auth/withings/revoke', middlewares.auth(), async (req, res, next) => {
    try {
      await OauthServices.revokeDeviceToken('withings');
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  });

  route.get('/auth/withings/callback', async (req, res, next) => {
    const { code, state } = req.query;
    const options = { code, redirect_uri: devices.oura.redirectUri };

    try {
      const decoded = jwt.verify(state, process.env.JWT_SECRET);
      const user = await UserServices.getUser(decoded._id);
      if (!user) {
        throw new Error('No user ID provided in auth/oura/callback JWT state');
      }
      const result = await devices.withings.oauth2.authorizationCode.getToken(options);
      const token = devices.withings.oauth2.accessToken.create(result);

      if (user.accounts.oura.connected) {
        await OauthServices.revokeDeviceToken(user, 'oura');
      }
      await UserServices.setDeviceToken(user, 'withings', { ...token.token });

      // Sync Data asynchronously
      OuraServices.syncSleepSummary(user);

      res.redirect(`${config.frontEndUri}/settings`);
    } catch (error) {
      Logger.error(error);
      res.redirect(`${config.frontEndUri}/settings`);
    }
  });
};
