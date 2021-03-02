import Logger from '../loaders/logger';
import config from '../config';
import { getUserByStripeCustomer } from './UserServices';
import { ErrorHandler } from '../utils/error';

const stripe = require('stripe')(config.stripe.api_key);

const TX_TAX_ID = 'txr_1IQHWoHTjrDKdTifTvzMQ8zu';

export const createStripeCustomer = async (user) => {
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
  });
  if (customer) {
    user.stripe = {
      customerId: customer.id,
      email: customer.email,
    };
    await user.save();
    return customer;
  }
  return null;
};

export const createCheckoutSession = async (user, priceId) => {
  if (!user.stripe || !user.stripe.customerId) {
    await createStripeCustomer(user);
  }

  const sessionOptions = {
    customer: user.stripe.customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
        dynamic_tax_rates: [
          TX_TAX_ID,
        ],
      },
    ],
    allow_promotion_codes: true,
    success_url: `${config.frontEndUri}/plans/success/{CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.frontEndUri}/plans`,
  };

  if (!user.stripe.trialed) {
    if (user.settings && user.settings.powerUser) {
      sessionOptions.subscription_data = {
        trial_period_days: 30,
      };
    } else {
      sessionOptions.subscription_data = {
        trial_period_days: 14,
      };
    }
  }

  const session = await stripe.checkout.sessions.create(sessionOptions);

  return session;
};

export const getCustomerPortal = async (user) => {
  if (!user.stripe || !user.stripe.customerId) {
    await createStripeCustomer(user);
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripe.customerId,
    return_url: config.frontEndUri,
  });

  return portalSession;
};

export const getCheckoutSession = async (sessionId) => {
  if (!sessionId) {
    throw new ErrorHandler(400, 'No sessionId associated with ');
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const subscription = await stripe.subscriptions.retrieve(
    session.subscription,
  );
  const { product: productId } = subscription.plan;
  const product = await stripe.products.retrieve(productId);

  return { session, subscription, product };
};

export const onSubscriptionComplete = async (user, sessionId) => {
  if (!user) {
    throw new ErrorHandler(400, 'No user associated with this purchase');
  }
  if (!sessionId) {
    throw new ErrorHandler(400, 'No sessionId');
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const subscription = await stripe.subscriptions.retrieve(
    session.subscription,
  );
  const { product: productId } = subscription.plan;
  const product = await stripe.products.retrieve(productId);
  user.stripe.subscription = {
    id: subscription.id,
    status: subscription.status,
    type: product.metadata.subscription_type,
  };
  user.stripe.trialed = true;

  await user.save();
  return { session, subscription, product };
};

export const extractWebhookEvent = async (req) => {
  let event;
  const webhookSecret = config.stripe.signing_secret;
  if (webhookSecret) {
    const signature = req.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        webhookSecret,
      );
      return event;
    } catch (error) {
      throw new ErrorHandler(400, '⚠️  Webhook signature verification failed.');
    }
  }
  return { data: req.body.data, type: req.body.type };
};

const onCheckoutSessionCompleted = async (session) => {
  if (!session) {
    throw new ErrorHandler(400, 'Missing Session.');
  }
  const user = await getUserByStripeCustomer(session.customer);
  if (!user) {
    throw new ErrorHandler(400,
      `No user associated with Stripe Customer ID: ${session.customer}`,
    );
  }

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription,
  );
  const { product: productId } = subscription.plan;
  const product = await stripe.products.retrieve(productId);

  user.stripe.subscription = {
    id: subscription.id,
    status: subscription.status,
    type: product.metadata.subscription_type,
  };
  user.stripe.trialed = true;

  await user.save();
};

const onCustomerUpdated = async (customer) => {
  if (!customer) {
    throw new ErrorHandler(400, 'Missing customer');
  }

  const user = await getUserByStripeCustomer(customer.id);

  if (!user) {
    throw new ErrorHandler(400, `No user associated with Stripe Customer ID: ${customer.id}`);
  }
  user.stripe.email = customer.email;
  await user.save();
};

const onSubscriptionUpdated = async (subscription) => {
  if (!subscription) {
    throw new ErrorHandler(400, 'Missing customer');
  }

  const user = await getUserByStripeCustomer(subscription.customer);

  if (!user) {
    throw new ErrorHandler(400, `No user associated with Stripe Customer ID: ${subscription.customer}`);
  }

  const { product: productId } = subscription.plan;
  const product = await stripe.products.retrieve(productId);
  user.stripe.subscription = {
    id: subscription.id,
    status: subscription.status,
    type: product.metadata.subscription_type,
  };
  await user.save();
};

export const processWebhookEvent = async (event) => {
  if (!event) {
    throw new ErrorHandler(400, 'Missing webhook event');
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await onCheckoutSessionCompleted(event.data.object);
      break;
    case 'customer.updated':
      await onCustomerUpdated(event.data.object);
      break;
    case 'customer.subscription.updated':
      await onSubscriptionUpdated(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await onSubscriptionUpdated(event.data.object);
      break;
    default:
      Logger.info(`Stripe Webhook Event (${event.type}) not setup`);
  }
};
