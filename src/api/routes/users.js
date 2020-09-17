import { Router } from 'express';
import { validate } from 'express-validation';
import config from '../../config';
import validators from '../middlewares/validators';
import UserServices from '../../services/UserServices';
import { insertDefaultTags } from '../../services/TagsServices';
import middlewares from '../middlewares';
import validationSchemas from '../middlewares/validationSchemas';
import { ErrorHandler } from '../../utils/error';
import Roles from '../../utils/roles';

const route = Router();

export default (app) => {
  app.use('/users', route);

  route.get('', middlewares.auth(Roles.admin), async (req, res, next) => {
    try {
      const { query } = req;
      const data = await UserServices.get(query);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });

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
      await insertDefaultTags(user._id);
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

  route.patch('/me/session-stats', middlewares.auth(), async (req, res, next) => {
    try {
      const stats = await UserServices.updateSessionStats(req.user, req.body);
      return res.json(stats);
    } catch (error) {
      return next(error);
    }
  });

  // route.delete('/me', middlewares.auth(), async (req, res, next) => {
  //   try {
  //     await UserServices.userDelete(req.user);
  //     return res.status(204).send();
  //   } catch (error) {
  //     return next(error);
  //   }
  // });

  route.post('/me/tags', middlewares.auth(), validate(validationSchemas.insertTag, { context: true }), async (req, res, next) => {
    try {
      const { tag } = req.body;
      if (!tag) {
        throw new ErrorHandler(400, 'Must provide tag.');
      }
      const tags = await UserServices.insertTag(tag, req.user);
      return res.json(tags);
    } catch (error) {
      return next(error);
    }
  });

  route.get('/me/tags', middlewares.auth(), async (req, res, next) => {
    try {
      return res.json(req.user.settings.customTags);
    } catch (error) {
      return next(error);
    }
  });

  route.put('/me/tags/:id', middlewares.auth(), validate(validationSchemas.updateTag, { context: true }), async (req, res, next) => {
    try {
      const { id } = req.params;
      const { tag } = req.body;
      if (tag._id !== id) {
        throw new ErrorHandler(400, 'Must provide valid, matching Ids');
      }
      const tags = await UserServices.updateTag(tag, req.user);
      return res.json(tags);
    } catch (error) {
      return next(error);
    }
  });

  route.delete('/me/tags/:id', middlewares.auth(), validate(validationSchemas.deleteTag, { context: true }), async (req, res, next) => {
    try {
      const { id } = req.params;
      const tags = await UserServices.deleteTag(id, req.user);
      return res.json(tags);
    } catch (error) {
      return next(error);
    }
  });
};
