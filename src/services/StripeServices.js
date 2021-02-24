import config from '../config';

const stripe = require('stripe')(config.stripe.api_key);

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
        // For metered billing, do not pass quantity
        quantity: 1,
      },
    ],
    // {CHECKOUT_SESSION_ID} is a string literal; do not change it!
    // the actual Session ID is returned in the query parameter when your customer
    // is redirected to the success page.
    success_url: `${config.frontEndUri}/plans/success/{CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.frontEndUri}/plans`,
  };

  if (!user.stripe.trialed) {
    sessionOptions.subscription_data = {
      trial_period_days: 14,
    };
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
    throw new Error('No sessionId associated with ');
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
    throw new Error('No user associated with this purchase');
  }
  if (!sessionId) {
    throw new Error('No sessionId associated with ');
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
