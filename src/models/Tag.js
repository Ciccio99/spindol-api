import mongoose from 'mongoose';
import baseStatsSchema from './schemas/baseStats';

const tagSchema = new mongoose.Schema({
  tag: {
    type: String,
    trim: true,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  isGoal: {
    type: Boolean,
    default: false,
  },
  sleepTrial: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SleepTrial',
  },
  stats: baseStatsSchema,
}, {
  timestamps: true,
});

const Tag = mongoose.model('Tag', tagSchema);

export default Tag;
