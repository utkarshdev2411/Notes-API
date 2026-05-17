const { Router } = require('express');
const { body } = require('express-validator');
const authenticate = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  shareNote,
} = require('../controllers/notes.controller');

const router = Router();

const noteBodyRules = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('content').notEmpty().withMessage('Content is required'),
];

router.get('/', authenticate, getAllNotes);

router.get('/:id', authenticate, getNoteById);

router.post('/', authenticate, noteBodyRules, validate, createNote);

router.put('/:id', authenticate, noteBodyRules, validate, updateNote);

router.delete('/:id', authenticate, deleteNote);

router.post(
  '/:id/share',
  authenticate,
  [body('share_with_email').isEmail().withMessage('Valid email is required')],
  validate,
  shareNote
);

module.exports = router;
