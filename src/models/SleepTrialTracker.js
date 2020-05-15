import mongoose from 'mongoose';
import moment from 'moment-timezone';

const sleepTrialTrackerSchema = new mongoose.Schema({
  sleepTrial: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'SleepTrial',
  },
  trialLength: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    default: moment.utc().startOf('day').toISOString(),
  },
  endDate: {
    type: Date,
  },
  completed: {
    type: Boolean,
  },
  active: {
    type: Boolean,
    default: true,
  },
  checkIns: [{
    date: {
      type: Date,
    },
    completed: {
      type: Boolean,
    },
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
}, {
  timestamps: true,
});


const SleapTrialTracker = mongoose.model('SleepTrialTracker', sleepTrialTrackerSchema);

export default SleapTrialTracker;
