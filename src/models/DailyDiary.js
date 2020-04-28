import mongoose from 'mongoose';

/**
* Date,
* Mood,
* tags []
*/
const dailyDiarySchema = new mongoose.Schema({
  date: {
    type: Date,
    unique: true,
  },
  mood: {
    type: String,
    enum: ['awful', 'bad', 'meh', 'good', 'excellent'],
  },
  tags: [String],
}, {
  timestamps: true,
});

const DailyDiary = mongoose.model('DailyDiary', dailyDiarySchema);

export default DailyDiary;
