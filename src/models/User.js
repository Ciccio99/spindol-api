import { ErrorHandler } from '../utils/error';

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    async validate(value) {
      if (!validator.isEmail(value)) {
        throw new ErrorHandler(400, 'Email is invalid.');
      }
      if (this.isNew && await User.findOne({ email: value })) {
        throw new ErrorHandler(400, 'Email already in use.');
      }
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error('Password can not include "password".');
      }
    },
  },
  dob: {
    type: Date,
    validate(value) {
      const now = new Date();
      const minimumDate = new Date();
      minimumDate.setUTCFullYear(now.getUTCFullYear() - 18);
      if (value.getTime() > minimumDate.getTime()) {
        throw new Error('Must be 18 years of age in order to use the SleepWell.ai service.');
      }
    },
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error('Age must be a positive number.');
      }
    },
  },
  phoneNumber: {
    type: String,
    validate(value) {
      if (!validator.isMobilePhone(value)) {
        throw new Error('Must be a valid phone number.');
      }
    },
  },
  address: {
    street1: {
      type: String,
    },
    street2: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    zip: {
      type: String,
    },
    country: {
      type: String,
    },
  },
  weight: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error('Weight must be a positive number');
      }
    },
  },
  height: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) {
        throw new Error('Weight must be a positive number');
      }
    },
  },
  sex: {
    type: Number,
    default: 0,
    validate(value) {
      if (value > 2 || value < 0) {
        throw new Error('Gender must be a number between 0 and 2.');
      }
    },
  },
  occupation: {
    type: String,
    lowercase: true,
    trim: true,
    default: '',
  },
  avatar: {
    type: Buffer,
  },
  active: {
    type: Boolean,
    default: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    lowercase: true,
    trim: true,
  },
  tokens: [{
    token: {
      type: String,
      required: true,
    },
  }],
  accounts: {
    withings: {
      token: {
        access_token: {
          type: String,
          default: '',
        },
        refresh_token: {
          type: String,
          default: '',
        },
        token_type: {
          type: String,
          default: '',
        },
        expires_at: {
          type: Date,
        },
        expires_in: {
          type: Number,
          default: 0,
        },
      },
      userid: {
        type: String,
        default: '',
      },
      connected: {
        type: Boolean,
        default: false,
      },
    },
    oura: {
      token: {
        access_token: {
          type: String,
          default: '',
        },
        refresh_token: {
          type: String,
          default: '',
        },
        token_type: {
          type: String,
          default: '',
        },
        expires_at: {
          type: Date,
        },
        expires_in: {
          type: Number,
        },
      },
      userid: {
        type: String,
        default: '',
      },
      connected: {
        type: Boolean,
        default: false,
      },
    },
    fitbit: {
      token: {
        access_token: {
          type: String,
          default: '',
        },
        refresh_token: {
          type: String,
          default: '',
        },
        token_type: {
          type: String,
          default: '',
        },
        expires_at: {
          type: Date,
        },
        expires_in: {
          type: Number,
          default: 0,
        },
      },
      userid: {
        type: String,
        default: '',
      },
      connected: {
        type: Boolean,
        default: false,
      },
    },
  },
  lastLogin: {
    type: Date,
  },
  settings: {
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
      default: [
        'work',
        'family',
        'friends',
        'meditation',
        'cooked',
        'exercise',
        'relaxed',
      ],
    }],
  },
}, {
  timestamps: true,
});

// Connect User to their Sleep Summary data
userSchema.virtual('sleepTrialTrackers', {
  ref: 'SleepTrialTracker',
  localField: '_id',
  foreignField: 'owner',
});

// Connect User to their Sleep Summary data
userSchema.virtual('sleepSummaries', {
  ref: 'SleepSummary',
  localField: '_id',
  foreignField: 'owner',
});

// Connect User to their Daily Diary data
userSchema.virtual('dailyDiaries', {
  ref: 'DailyDiary',
  localField: '_id',
  foreignField: 'owner',
});

// Connect User to their Habits
userSchema.virtual('habits', {
  ref: 'Habit',
  localField: '_id',
  foreignField: 'owner',
});

userSchema.methods.toJSON = function toJSON() {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.avatar;
  delete userObject.tokens;
  delete userObject.accounts.oura.token;
  delete userObject.accounts.withings.token;
  delete userObject.accounts.fitbit.token;

  return userObject;
};

userSchema.methods.generateAuthToken = async function generateAuthToken() {
  const user = this;
  const token = jwt.sign({
    _id: user._id.toString(),
  },
  process.env.JWT_SECRET,
  {
    expiresIn: '7d',
  });

  user.lastLogin = new Date();
  user.tokens = user.tokens.concat({ token });

  await user.save();

  return token;
};

userSchema.methods.checkPassword = async function checkPassword(password) {
  const user = this;

  const isMatch = await bcrypt.compare(password, user.password);
  return isMatch;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ErrorHandler(401, 'Unable to authenticate');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ErrorHandler(401, 'Unable to authenticate');
  }

  await user.save();

  return user;
};

userSchema.pre('save', async function pre(next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

const User = mongoose.model('User', userSchema);

export default User;
