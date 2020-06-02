import { Router } from 'express';
import { validate } from 'express-validation';
import validationSchemas from '../middlewares/validationSchemas';
import oauth from '../../loaders/oauth';
import config from '../../config';
import { ErrorHandler } from '../../utils/error';
import Logger from '../../loaders/logger';
import UserServices from '../../services/UserServices';
import OuraServices from '../../services/OuraServices';
import middlewares from '../middlewares';

const jwt = require('jsonwebtoken');

const devices = {
  oura: {
    ...oauth.oura(),
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
    const authorizationUri = devices.oura.oauth2.authorizationCode.authorizeURL({
      redirect_uri: devices.oura.redirectUri,
      state: jwt.sign({ _id: req.user._id.toString() }, process.env.JWT_SECRET),
    });
    // return res.json(`${config.baseUrl}/api/devices/auth/oura`);
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

  // TODO: confirm that this may not beed needed Anymore
  route.get('/auth/oura', middlewares.auth(), (req, res, next) => {
    res.redirect(devices.oura.authorizationUri);
  });

  route.get('/auth/oura/revoke', middlewares.auth(), async (req, res, next) => {
    try {
      // TODO: Investigate why Authroisation is not allowed for revoking all. Is Oura not Oauth2.0
      // THere is an issue on github talking about: https://github.com/lelylan/simple-oauth2/issues/106
      // const token = devices.oura.oauth2.accessToken.create({ ...req.user.accounts.oura.token });
      // await token.revokeAll();
      req.user.accounts.oura.token = {};
      req.user.accounts.oura.connected = false;
      await req.user.save();
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

      await UserServices.setDeviceToken(user, 'oura', { ...token.token });

      // Sync Data asynchronously
      OuraServices.syncSleepSummary(user);

      res.redirect(`${config.frontEndUri}/settings`);
    } catch (error) {
      Logger.error(error);
      res.redirect(`${config.frontEndUri}/settings`);
    }
  });
};
