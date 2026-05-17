const mongoose = require('mongoose');
const Note = require('../models/Note');
const { formatNote } = require('../utils/response');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find({
      $or: [
        { owner: req.user.id },
        { sharedWith: req.user.id },
      ],
    }).sort({ isPinned: -1, updatedAt: -1 });

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
    const { title, content } = req.body;

    const note = await Note.create({
      title,
      content,
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
    const { title, content } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid note ID format' });
    }

    const note = await Note.findOneAndUpdate(
      { _id: id, owner: req.user.id },
      { title, content },
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

module.exports = { getAllNotes, getNoteById, createNote, updateNote, deleteNote };
