import SleepTrial from '../models/SleepTrial';

const getSleepTrial = async (id) => {
  const sleepTrial = await SleepTrial.findById(id);
  return sleepTrial;
};

const querySleepTrial = async (query) => {
  const data = await SleepTrial.find(query);
  return data;
};

const createSleepTrial = async (sleepTrialDTO) => {
  const sleepTrial = new SleepTrial({ ...sleepTrialDTO });
  await sleepTrial.save();
  return sleepTrial;
};

const createMany = async (sleepTrials) => {
  const results = await SleepTrial.insertMany(sleepTrials);
  return results;
};

const deleteSleepTrial = async (id) => {
  await SleepTrial.findByIdAndDelete(id);
};

export default {
  getSleepTrial,
  querySleepTrial,
  createSleepTrial,
  createMany,
  deleteSleepTrial,
};
