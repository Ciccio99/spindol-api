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
