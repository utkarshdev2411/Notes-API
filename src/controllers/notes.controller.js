const mongoose = require('mongoose');
const Note = require('../models/Note');
const User = require('../models/User');
const { formatNote } = require('../utils/response');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const getAllNotes = async (req, res) => {
  try {
    const query = {
      $or: [
        { owner: req.user.id },
        { sharedWith: req.user.id },
      ],
    };

    const { page, limit } = req.query;
    const isPaginated = page !== undefined || limit !== undefined;

    if (isPaginated) {
      const pageNum = Math.max(parseInt(page) || 1, 1);
      const limitNum = Math.min(parseInt(limit) || 10, 100);
      const skip = (pageNum - 1) * limitNum;

      const [notes, total] = await Promise.all([
        Note.find(query)
          .sort({ isPinned: -1, updatedAt: -1 })
          .skip(skip)
          .limit(limitNum),
        // countDocuments does not trigger pre-find middleware, so isDeleted must be explicit
        Note.countDocuments({ ...query, isDeleted: false }),
      ]);

      return res.status(200).json({
        data: notes.map(formatNote),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    }

    const notes = await Note.find(query).sort({ isPinned: -1, updatedAt: -1 });
    return res.status(200).json(notes.map(formatNote));
  } catch (err) {
    console.error('getAllNotes error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid note ID format' });
    }

    const note = await Note.findOne({
      _id: id,
      $or: [
        { owner: req.user.id },
        { sharedWith: req.user.id },
      ],
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    return res.status(200).json(formatNote(note));
  } catch (err) {
    console.error('getNoteById error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const createNote = async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    const note = await Note.create({
      title,
      content,
      tags: Array.isArray(tags) ? tags : [],
      owner: req.user.id,
    });

    return res.status(201).json(formatNote(note));
  } catch (err) {
    console.error('createNote error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid note ID format' });
    }

    const updateFields = { title, content };
    if (Array.isArray(tags)) updateFields.tags = tags;

    const note = await Note.findOneAndUpdate(
      { _id: id, owner: req.user.id },
      updateFields,
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    return res.status(200).json(formatNote(note));
  } catch (err) {
    console.error('updateNote error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid note ID format' });
    }

    const note = await Note.findOneAndUpdate(
      { _id: id, owner: req.user.id },
      { isDeleted: true, deletedAt: new Date() }
    );

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    return res.status(204).send();
  } catch (err) {
    console.error('deleteNote error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const shareNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { share_with_email } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid note ID format' });
    }

    const note = await Note.findOne({ _id: id, owner: req.user.id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const targetUser = await User.findOne({ email: share_with_email });
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUser._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot share note with yourself' });
    }

    const alreadyShared = note.sharedWith.some(
      (uid) => uid.toString() === targetUser._id.toString()
    );
    if (alreadyShared) {
      return res.status(400).json({ message: 'Note already shared with this user' });
    }

    note.sharedWith.push(targetUser._id);
    await note.save();

    return res.status(200).json({ message: 'Note shared successfully' });
  } catch (err) {
    console.error('shareNote error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const pinNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPinned } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid note ID format' });
    }

    const note = await Note.findOneAndUpdate(
      { _id: id, owner: req.user.id },
      { isPinned },
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    return res.status(200).json(formatNote(note));
  } catch (err) {
    console.error('pinNote error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const searchNotes = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const notes = await Note.find({
      $text: { $search: q },
      $or: [
        { owner: req.user.id },
        { sharedWith: req.user.id },
      ],
    }).sort({ isPinned: -1, updatedAt: -1 });

    return res.status(200).json(notes.map(formatNote));
  } catch (err) {
    console.error('searchNotes error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getAllNotes, getNoteById, createNote, updateNote, deleteNote, shareNote, pinNote, searchNotes };
