import { Router } from 'express';
import { extractWebhookEvent, processWebhookEvent } from '../../services/StripeServices';

const route = Router();

export default (app) => {
  app.use('/stripe-webhooks', route);

  route.post('', async (req, res, next) => {
    try {
      const event = await extractWebhookEvent(req);
      await processWebhookEvent(event);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  });
};
