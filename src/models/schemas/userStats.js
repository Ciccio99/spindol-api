import mongoose from 'mongoose';
import baseStatsSchema from './baseStats';

const userStatsSchema = new mongoose.Schema({
  morningMood: baseStatsSchema,
});

export default userStatsSchema;
