import mongoose from 'mongoose';

const dailyReminderSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  deliveryType: {
    type: String,
    enum: ['email', 'sms'],
    required: true,
    default: 'email',
  },
  dueTime: {
    type: Number,
    required: true,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
});

const DailyReminder = mongoose.model('DailyReminder', dailyReminderSchema);

export default DailyReminder;
