import { Router } from 'express';
import { validate } from 'express-validation';
import EmailServices from '../../services/EmailServices';
import validationSchemas from '../middlewares/validationSchemas';
import middlewares from '../middlewares';
import roles from '../../utils/roles';

const route = Router();

export default (app) => {
  app.use('/admin', route);

  route.post('/invite',
    middlewares.auth(roles.admin),
    validate(validationSchemas.adminInviteUser),
    async (req, res, next) => {
      try {
        await EmailServices.sendRegisterEmail(req.body.email);
        return res.status(204).send();
      } catch (error) {
        return next(error);
      }
    });
};
