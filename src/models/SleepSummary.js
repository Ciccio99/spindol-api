import mongoose from 'mongoose';

const sleepSummarySchema = mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  timezone: {
    type: String,
  },
  timezoneOffset: {
    type: Number,
    required: true,
  },
  startDateTime: {
    type: Date,
    required: true,
  },
  endDateTime: {
    type: Date,
    required: true,
  },
  lightSleepDuration: {
    type: Number,
  },
  deepSleepDuration: {
    type: Number,
  },
  remSleepDuration: {
    type: Number,
  },
  durationToSleep: {
    type: Number,
  },
  awakeDuration: {
    type: Number,
  },
  efficiency: {
    type: Number,
  },
  timeToWakeUp: {
    type: Number,
  },
  wakeUpCount: {
    type: Number,
  },
  hrAverage: {
    type: Number,
  },
  hrMin: {
    type: Number,
  },
  hrMax: {
    type: Number,
  },
  rrAverage: {
    type: Number,
  },
  rrMin: {
    type: Number,
  },
  rrMax: {
    type: Number,
  },
  breathingDisturbancesIntensity: {
    type: Number,
  },
  snoringDuration: {
    type: Number,
  },
  snoringCount: {
    type: Number,
  },
  sleepScore: {
    type: Number,
  },
  latency: {
    type: Number,
  },
  source: {
    type: String,
    enum: ['oura', 'withings', 'fitbit', 'manual'],
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
}, {
  timestamps: true,
});

const SleepSummary = mongoose.model('SleepSummary', sleepSummarySchema);

export default SleepSummary;
