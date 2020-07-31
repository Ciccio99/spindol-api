import mongoose from 'mongoose';

/**
* Date,
* Mood,
* tags []
*/
const dailyDiarySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  mood: {
    type: String,
    enum: ['awful', 'bad', 'meh', 'good', 'excellent'],
  },
  fatigueScore: {
    type: Number,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  sleepSummary: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SleepSummary',
  },
  sleepTrialTrackers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SleepTrialTracker',
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
}, {
  timestamps: true,
});

const DailyDiary = mongoose.model('DailyDiary', dailyDiarySchema);

export default DailyDiary;
