import Tag from '../models/Tag';
import defaultTags from '../utils/constants/defaultTags';

export const queryTags = async (query) => Tag.find(query).populate('sleepTrial').exec();

export const getAllUserTags = async (userId) => Tag.find({ owner: userId });

export const getTagById = async (tagId) => Tag.findById(tagId).populate('sleepTrial').exec();

export const insertTag = async (dto) => {
  const tag = await Tag.create(dto);
  await tag.populate('sleepTrial').execPopulate();
  return tag;
};

export const updateTag = async (dto) => Tag.findByIdAndUpdate(dto._id, dto, { new: true }).populate('sleepTrial').exec();

export const deleteTag = async (tagId) => Tag.findByIdAndDelete(tagId);

export const insertDefaultTags = async (userId) => Tag
  .insertMany(defaultTags.map((value) => ({
    tag: value,
    owner: userId,
  })));
