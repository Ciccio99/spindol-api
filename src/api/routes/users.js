import { Router } from 'express';
import { validate } from 'express-validation';
import config from '../../config';
import validators from '../middlewares/validators';
import UserServices from '../../services/UserServices';
import middlewares from '../middlewares';
import validationSchemas from '../middlewares/validationSchemas';
import { ErrorHandler } from '../../utils/error';

const route = Router();

export default (app) => {
  app.use('/users', route);

  // SIGN IN
  route.post('/login', validators.userLogin, async (req, res, next) => {
    try {
      const { user, token } = await UserServices.userLogin(req.userDTO);
      return res.json({ user, token });
    } catch (error) {
      return next(error);
    }
  });

  route.post('/token-login', middlewares.auth(), async (req, res, next) => {
    try {
      const { user, token } = req;

      if (!user) {
        throw new ErrorHandler(401, 'Please authenticate');
      }

      const newToken = await req.user.generateAuthToken();
      await UserServices.userRemoveToken(user, token);
      return res.json({ user, token: newToken });
    } catch (error) {
      return next(error);
    }
  });

  route.post('/logout', middlewares.auth(), async (req, res, next) => {
    try {
      await UserServices.userLogout(req.user, req.token);
      res.clearCookie(config.authCookieName);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  });

  route.post('/register', validate(validationSchemas.registerUserSchema, { keyByField: true }), async (req, res, next) => {
    try {
      const dto = { ...req.body };
      const { user, token } = await UserServices.userRegister(dto);
      return res.json({ user, token });
    } catch (error) {
      return next(error);
    }
  });

  // ME
  route.patch('/me', middlewares.auth(), validate(validationSchemas.userUpdate), async (req, res, next) => {
    try {
      const user = await UserServices.userEdit(req.user, req.body);
      return res.json({ user });
    } catch (error) {
      return next(error);
    }
  });

  route.get('/me', middlewares.auth(), async (req, res) => res.json({ user: req.user }));

  // route.delete('/me', middlewares.auth(), async (req, res, next) => {
  //   try {
  //     await UserServices.userDelete(req.user);
  //     return res.status(204).send();
  //   } catch (error) {
  //     return next(error);
  //   }
  // });

  route.post('/tags', middlewares.auth(), validate(validationSchemas.tags, { context: true }), async (req, res, next) => {
    try {
      const { tags } = req.body;
      if (!tags || tags.length === 0) {
        throw new ErrorHandler(400, 'Must provide tags.');
      }
      const currTags = await UserServices.upsertTags(tags, req.user);
      return res.json({ tags: currTags });
    } catch (error) {
      return next(error);
    }
  });

  route.put('/me/tags', middlewares.auth(), validate(validationSchemas.tags, { context: true }), async (req, res, next) => {
    try {
      const { tags } = req.body;
      if (!tags) {
        throw new ErrorHandler(400, 'Must provide tags.');
      }
      const currTags = await UserServices.insertTags(tags, req.user);
      return res.json({ tags: currTags });
    } catch (error) {
      return next(error);
    }
  });

  route.delete('/tags', middlewares.auth(), validate(validationSchemas.tags, { context: true }), async (req, res, next) => {
    try {
      const { tags } = req.body;
      if (!tags || tags.length === 0) {
        throw new ErrorHandler(400, 'Must provide tags.');
      }
      const currTags = await UserServices.removeTags(tags, req.user);
      return res.json({ tags: currTags });
    } catch (error) {
      return next(error);
    }
  });
};
