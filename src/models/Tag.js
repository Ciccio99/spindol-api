import mongoose from 'mongoose';

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
}, {
  timestamps: true,
});

const Tag = mongoose.model('Tag', tagSchema);

export default Tag;
