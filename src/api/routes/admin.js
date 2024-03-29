import { Router } from 'express';
import { validate } from 'express-validation';
import EmailServices from '../../services/EmailServices';
import validationSchemas from '../middlewares/validationSchemas';
import middlewares from '../middlewares';
import roles from '../../utils/roles';
import { generateInviteLink, upsertDailyRemindersAllUsers, updateUserPassword } from '../../services/AdminServices';
import { ErrorHandler } from '../../utils/error';
import { convertUserTags, convertAllUserTags, removeDiaryTags } from '../../services/UpdatesServices';
import { exportQuery as queryDailyDiaries } from '../../services/DailyDiaryServices';

const route = Router();

export default (app) => {
  app.use('/admin', route);

  route.post('/update-user-password', middlewares.auth(roles.admin), async (req, res, next) => {
    try {
      const { email, newPassword } = req.body;
      if (!email) {
        throw new ErrorHandler(400, 'Must provide user email');
      }
      if (!newPassword || newPassword.length === 0) {
        throw new ErrorHandler(400, 'Must provide new password');
      }
      await updateUserPassword(email, newPassword);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  });

  route.post('/upsert-reminders-all-users',
    middlewares.auth(roles.admin),
    async (req, res, next) => {
      try {
        const results = await upsertDailyRemindersAllUsers();
        return res.json({ results });
      } catch (error) {
        return next(error);
      }
    });

  route.post('/remove-diary-tags',
    middlewares.auth(roles.admin),
    async (req, res, next) => {
      try {
        await removeDiaryTags();
        return res.status(204).send();
      } catch (error) {
        return next(error);
      }
    });

  route.post('/update-user-tags/:id',
    middlewares.auth(roles.admin),
    async (req, res, next) => {
      try {
        const { id } = req.params;
        if (!id) {
          throw new ErrorHandler(400, 'Id required');
        }
        await convertUserTags(id);
        return res.status(204).send();
      } catch (error) {
        return next(error);
      }
    });


  route.post('/convert-all-user-tags',
    middlewares.auth(roles.admin),
    async (req, res, next) => {
      try {
        await convertAllUserTags();
        return res.status(204).send();
      } catch (error) {
        return next(error);
      }
    });

  route.post('/generate-invite',
    middlewares.auth(roles.admin),
    validate(validationSchemas.adminInviteUser),
    async (req, res, next) => {
      try {
        const link = await generateInviteLink(req.body.email);
        return res.json({ link });
      } catch (error) {
        return next(error);
      }
    });

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

  route.post('/invite-many',
    middlewares.auth(roles.admin),
    validate(validationSchemas.adminInviteManyUsers),
    async (req, res, next) => {
      try {
        const { emails } = req.body;
        if (emails.length === 0) {
          throw new ErrorHandler(400, 'Must have at least one email in emails array.');
        }

        const emailPromises = emails.map(async (email) => EmailServices.sendRegisterEmail(email));

        await Promise.all(emailPromises);

        return res.status(204).send();
      } catch (error) {
        return next(error);
      }
    });

  route.post('/registerMarketingEmail', middlewares.auth(roles.admin), async (req, res, next) => {
    try {
      const { email, name } = req.body;
      if (!email) {
        throw new ErrorHandler(400, 'Must provide email');
      }
      await EmailServices.registerMarketingRecipient(email, name);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  });

  route.get('/getUserData', middlewares.auth(roles.admin), async (req, res, next) => {
    try {
      const { userId } = req.query;
      if (!userId) throw new ErrorHandler(400, 'Must provide a userId');
      const query = {
        match: {}, sort: { date: -1 }, skip: 0, limit: 0,
      };
      const data = await queryDailyDiaries(query, { _id: userId });
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });
};
