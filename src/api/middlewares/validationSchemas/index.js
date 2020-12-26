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
      email: Joi.string().trim().max(100).email().required()
        .messages({ 'string.email': 'Invalid email.' }),
      name: Joi.string().trim().max(100).required()
        .messages({ 'any.only': 'Must include your fullname.' }),
      password: Joi.string().trim().min(7).max(100).invalid('password')
        .required(),
      confirmPassword: Joi.any().valid(Joi.ref('password')).required()
        .messages({ 'any.only': 'Passwords must match.' }),
      token: Joi.string().trim(),
    }),
  },
  adminInviteUser: {
    body: Joi.object({
      email: Joi.string().email().trim().required()
        .messages({ 'string.email': 'Invalid email.' }),
    }),
  },
  adminInviteManyUsers: {
    body: Joi.object({
      emails: Joi.array().items(Joi.string().email().lowercase().trim()
        .messages({ 'string.email': 'Invalid email.' })).required(),
    }),
  },
  createSleepTrialSchema: {
    body: Joi.object({
      name: Joi.string().trim().required(),
      trialLength: Joi.number().integer(),
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
      tags: Joi.array().items(Joi.string().lowercase().trim()),
    }),
  },
  updateDailyDiary: {
    body: Joi.object({
      _id: Joi.objectId().required(),
      date: Joi.date().iso(),
      mood: Joi.string().valid('awful', 'bad', 'meh', 'good', 'excellent').trim(),
      tags: Joi.array().items(Joi.string().lowercase().trim()),
    }),
  },
  patchDailyDiary: {
    params: Joi.object({
      id: Joi.objectId().required(),
    }),
    body: Joi.object({
      _id: Joi.objectId().required(),
      date: Joi.date().iso(),
      mood: Joi.string().lowercase().trim().valid('awful', 'bad', 'meh', 'good', 'excellent'),
      tags: Joi.array().items(Joi.string().lowercase().trim()),
      diaryTags: Joi.array().items(Joi.objectId()),
      journalEntry: Joi.string().allow(null, ''),
    }),
  },
  paramsDevices: {
    params: Joi.object({
      device: Joi.string().valid('oura', 'withings', 'fitbit').required(),
    }),
  },
  sleepSummaryCreate: {
    body: Joi.object({
      date: Joi.date().iso().required(),
      timezoneOffset: Joi.number().required(),
      startDateTime: Joi.date().iso().required(),
      endDateTime: Joi.date().iso().required(),
      source: Joi.string().trim().valid('oura', 'withings', 'fitbit', 'manual').required(),
    }).unknown(true),
  },
  sleepSummaryUpdate: {
    body: Joi.object({
      _id: Joi.objectId().required(),
      date: Joi.date().iso(),
      timezoneOffset: Joi.number(),
      startDateTime: Joi.date().iso(),
      endDateTime: Joi.date().iso(),
      source: Joi.string().trim().valid('oura', 'withings', 'fitbit', 'manual'),
    }).unknown(true),
  },
  userUpdate: {
    body: Joi.object({
      email: Joi.string().email().trim(),
      name: Joi.string().trim(),
      password: Joi.string().min(7).trim(),
      confirmPassword: Joi.when('password', {
        is: Joi.exist(),
        then: Joi.string().trim().required().valid(Joi.ref('password')),
      }),
      currentPassword: Joi.when('password', {
        is: Joi.exist(),
        then: Joi.string().trim().required(),
      }),
    }),
  },
  getFatigueScore: {
    query: Joi.object({
      date: Joi.date().iso().required(),
    }),
  },
  tags: {
    body: Joi.object({
      tags: Joi.array().items(Joi.object({
        _id: Joi.objectId(),
        tag: Joi.string().trim().required(),
      })).required(),
    }),
  },
  dailyDiaryTags: {
    params: Joi.object({
      id: Joi.objectId().required(),
    }),
    body: Joi.object({
      tags: Joi.array().items(Joi.objectId()),
    }),
  },
  tagById: {
    params: Joi.object({
      id: Joi.objectId().required(),
    }),
  },
  insertTag: {
    body: Joi.object({
      tag: Joi.string().trim().max(30).required(),
      isGoal: Joi.boolean(),
      sleepTrial: Joi.objectId(),
    }),
  },
  updateTag: {
    params: Joi.object({
      id: Joi.objectId().required(),
    }),
    body: Joi.object({
      _id: Joi.objectId().required(),
      tag: Joi.string().trim().max(30),
      isGoal: Joi.boolean(),
      sleepTrial: Joi.objectId(),
    }),
  },
  deleteTag: {
    params: Joi.object({
      id: Joi.objectId().required(),
    }),
  },
};

export default validationSchemas;
