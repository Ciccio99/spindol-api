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
  diaryTags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
  }],
  sleepSummary: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SleepSummary',
  },
  journalEntry: {
    type: String,
  },
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
