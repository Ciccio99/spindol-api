import Tag from '../models/Tag';
import defaultTags  from '../utils/constants/defaultTags';

export const getAllUserTags = async (userId) => Tag.find({ owner: userId });

export const getTagById = async (tagId) => Tag.findById(tagId);

export const insertTag = async (dto) => Tag.create(dto);

export const updateTag = async (dto) => Tag.findByIdAndUpdate(dto._id, dto, { new: true });

export const deleteTag = async (tagId) => Tag.findByIdAndDelete(tagId);

export const insertDefaultTags = async (userId) => Tag
  .insertMany(defaultTags.map((value) => ({
    tag: value,
    owner: userId,
  })));
