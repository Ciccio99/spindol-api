import { Router } from 'express';
import { validate } from 'express-validation';
import middlewares from '../middlewares';
import validationSchemas from '../middlewares/validationSchemas';
import { ErrorHandler } from '../../utils/error';
import {
  getAllUserTags,
  getTagById,
  insertTag,
  updateTag,
  deleteTag,
} from '../../services/TagsServices';

const route = Router();

export default (app) => {
  app.use('/tags', route);

  route.get('', middlewares.auth(), async (req, res, next) => {
    try {
      const data = await getAllUserTags(req.user._id);
      return res.json(data);
    } catch (e) {
      return next(e);
    }
  });

  route.get('/:id', middlewares.auth(), validate(validationSchemas.tagById), async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await getTagById(id);
      return res.json(data);
    } catch (e) {
      return next(e);
    }
  });

  route.post('', middlewares.auth(), validate(validationSchemas.insertTag), async (req, res, next) => {
    try {
      const dto = req.body;
      dto.owner = req.user._id;
      const data = await insertTag(dto);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });

  route.patch('/:id', middlewares.auth(), validate(validationSchemas.updateTag), async (req, res, next) => {
    try {
      const { id } = req.params;
      const dto = req.body;
      if (id !== dto._id) {
        throw new ErrorHandler(400, 'Ids do not match');
      }
      const data = await updateTag(dto);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });

  route.delete('/:id', middlewares.auth(), validate(validationSchemas.deleteTag), async (req, res, next) => {
    try {
      await deleteTag(req.params.id);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  });
};
