import { Router } from 'express';
import { validate } from 'express-validation';
import config from '../../config';
import validators from '../middlewares/validators';
import UserServices from '../../services/UserServices';
import middlewares from '../middlewares';
import validationSchemas from '../middlewares/validationSchemas';

const route = Router();

export default (app) => {
  app.use('/users', route);

  // SIGN IN
  route.post('/login', validators.userLogin, async (req, res, next) => {
    try {
      const { user, token } = await UserServices.userLogin(req.userDTO);
      // const options = {
      //   httpOnly: true,
      //   expires: moment().add(2, 'months').toDate(),
      //   secure: process.env.NODE_ENV !== 'development',
      //   sameSite: 'None',
      // };
      // res.cookie(config.authCookieName, token, options);
      return res.json({ user, token });
    } catch (error) {
      return next(error);
    }
  });

  route.post('/logout', middlewares.auth, async (req, res, next) => {
    try {
      await UserServices.userLogout(req.user, req.token);
      res.clearCookie(config.authCookieName);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  });

  route.post('/register', validate(validationSchemas.registerUserSchema, { keyByField: true }) /* validators.userRegister */, async (req, res, next) => {
    try {
      const dto = { ...req.body };
      const { user, token } = await UserServices.userRegister(dto);
      res.cookie(config.authCookieName, token, { httpOnly: true, expires: 0 });
      return res.json({ user });
    } catch (error) {
      return next(error);
    }
  });

  // ME
  route.patch('/me', middlewares.auth, validate(validationSchemas.userUpdate), async (req, res, next) => {
    try {
      const user = await UserServices.userEdit(req.user, req.body);
      return res.json({ user });
    } catch (error) {
      return next(error);
    }
  });

  route.get('/me', middlewares.auth, async (req, res) => res.json({ user: req.user }));

  route.delete('/me', middlewares.auth, async (req, res, next) => {
    try {
      await UserServices.userDelete(req.user);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  });
};
