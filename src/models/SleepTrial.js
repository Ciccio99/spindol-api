import mongoose from 'mongoose';

/**
* name,
* trialLength,
* shortDescription,
* description,
* areaOfEffect,
*/

const sleepTrialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['Behavior', 'Hardware', 'Supplement', 'Environment'],
  },
  trialLength: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value',
    },
  },
  directions: {
    type: String,
  },
  shortDescription: {
    type: String,
  },
  description: {
    type: String,
  },
  areasOfEffect: [{
    areaOfEffect: {
      type: String,
      trim: true,
      lowercase: true,
    },
  }],
}, {
  timestamps: true,
});

const SleepTrial = mongoose.model('SleepTrial', sleepTrialSchema);

export default SleepTrial;
