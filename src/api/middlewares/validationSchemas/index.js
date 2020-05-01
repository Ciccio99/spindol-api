import { Joi } from 'express-validation';

Joi.objectId = require('joi-objectid')(Joi);

const validationSchemas = {
  paramsId: {
    params: Joi.object({
      id: Joi.objectId(),
    }),
  },
  searchBodyQuery: {
    body: Joi.object({
      match: Joi.object({
        _id: Joi.objectId(),
        name: Joi.string(),
      }).unknown(),
      sort: Joi.object(),
      limit: Joi.number().integer(),
      skip: Joi.number().integer(),
    }),
  },
  registerUserSchema: {
    body: Joi.object({
      email: Joi.string().email().trim().required()
        .messages({ 'string.email': 'Invalid email' }),
      password: Joi.string().min(7).trim().required(),
      passwordConfirm: Joi.any().valid(Joi.ref('password')).required()
        .messages({ 'any.only': 'Passwords must match' }),
    }),
  },
  createSleepTrialSchema: {
    body: Joi.object({
      name: Joi.string().trim().required(),
      trialLength: Joi.number().integer().required(),
      type: Joi.string().valid('Behavior', 'Hardware', 'Supplement', 'Environment').trim().required(),
      directions: Joi.string(),
      shortDescription: Joi.string(),
      description: Joi.string(),
      areasOfEffect: Joi.array().items(Joi.object({
        areaOfEffect: Joi.string(),
      })),
    }),
  },
  createSleepTrialTracker: {
    body: Joi.object({
      sleepTrial: Joi.objectId().required(),
      trialLength: Joi.number().integer().required(),
      startDate: Joi.date().iso(),
      endDate: Joi.date().iso(),
      completed: Joi.boolean(),
      active: Joi.boolean(),
      checkIns: Joi.array().items(Joi.object({
        checkIn: Joi.object({
          date: Joi.date().iso(),
          completed: Joi.boolean(),
        }),
      })),
      owner: Joi.objectId().required(),
    }),
  },
  updateSleepTrialTracker: {
    body: Joi.object({
      _id: Joi.objectId().required(),
      sleepTrial: Joi.objectId(),
      trialLength: Joi.number().integer(),
      startDate: Joi.date().iso(),
      endDate: Joi.date().iso(),
      completed: Joi.boolean(),
      active: Joi.boolean(),
      checkIns: Joi.array().items(Joi.object({
        checkIn: Joi.object({
          date: Joi.date().iso(),
          completed: Joi.boolean(),
        }),
      })),
      owner: Joi.objectId(),
    }),
  },
  checkIn: {
    body: Joi.object({
      _id: Joi.objectId().required(),
      checkIn: Joi.object({
        date: Joi.date().iso(),
        completed: Joi.boolean(),
      }).required(),
    }),
  },
  createDailyDiary: {
    body: Joi.object({
      date: Joi.date().iso().required(),
      mood: Joi.string().valid('awful', 'bad', 'meh', 'good', 'excellent').trim().required(),
      tags: Joi.array().items(Joi.string()),
      owner: Joi.objectId(),
    }),
  },
  updateDailyDiary: {
    body: Joi.object({
      _id: Joi.objectId().required(),
      date: Joi.date().iso(),
      mood: Joi.string().valid('awful', 'bad', 'meh', 'good', 'excellent').trim().required(),
      tags: Joi.array().items(Joi.string()),
    }),
  },
  paramsDevices: {
    params: Joi.object({
      device: Joi.string().trim().valid('oura', 'withings', 'fitbit').required(),
    }),
  },
  sleepSummaryCreate: {
    body: Joi.object({
      date: Joi.date().iso().required(),
      timezone: Joi.string().required(),
      startDateTime: Joi.date().iso().required(),
      endDateTime: Joi.date().iso().required(),
      source: Joi.string().trim().valid('oura', 'withings', 'fitbit', 'manual').required(),
      owner: Joi.objectId().required(),
    }).unknown(true),
  },
  sleepSummaryUpdate: {
    body: Joi.object({
      _id: Joi.objectId().required(),
      date: Joi.date().iso(),
      timezone: Joi.string(),
      startDateTime: Joi.date().iso(),
      endDateTime: Joi.date().iso(),
      source: Joi.string().trim().valid('oura', 'withings', 'fitbit', 'manual'),
      owner: Joi.objectId(),
    }).unknown(true),
  },
};

export default validationSchemas;
