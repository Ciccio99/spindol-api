import { Router } from 'express';
import { validate } from 'express-validation';
import validationSchemas from '../middlewares/validationSchemas';
import middlewares from '../middlewares';
import config from '../../config';
import {
  createCheckoutSession,
  getCustomerPortal,
  onSubscriptionComplete,
  getCheckoutSession,
} from '../../services/StripeServices';

const route = Router();

// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = require('stripe')(
  'sk_test_51IMIXhHTjrDKdTifnKQGAXK8cmctICmr3gpvoIVYUCFeHcz1n0gUs4lVUzDJ76XUqEgBXQXzjF7V0CaaveXhC4JW008V6r4Hbe',
);

export default (app) => {
  app.use('/plans', route);

  route.post(
    '/create-checkout-session',
    middlewares.auth(),
    async (req, res, next) => {
      const { priceId } = req.body;

      // See https://stripe.com/docs/api/checkout/sessions/create
      // for additional parameters to pass.
      try {
        const session = await createCheckoutSession(req.user, priceId);
        return res.json({
          sessionId: session.id,
        });
      } catch (error) {
        return next(error);
      }
    },
  );

  route.get('/checkout-session', middlewares.auth(), async (req, res, next) => {
    const { sessionId } = req.query;
    try {
      const data = await getCheckoutSession(sessionId);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });

  route.post('/subscription-complete', middlewares.auth(), async (req, res, next) => {
    const { sessionId } = req.body;
    try {
      const data = await onSubscriptionComplete(req.user, sessionId);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });

  route.get('/customer-portal', middlewares.auth(), async (req, res, next) => {
    try {
      const portalSession = await getCustomerPortal(req.user);

      return res.json({ url: portalSession.url });
    } catch (error) {
      return next(error);
    }
  });
};
