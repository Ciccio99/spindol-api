import mongoose from 'mongoose';

const baseStatsSchema = new mongoose.Schema({
  currentStreak: {
    type: Number,
    default: 0,
  },
  highScore: {
    type: Number,
    default: 0,
  },
  lastUpdate: {
    type: Date,
  },
});

export default baseStatsSchema;
