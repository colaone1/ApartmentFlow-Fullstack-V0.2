const express = require('express');
const router = express.Router();
const { createNote, getApartmentNotes, deleteNote } = require('../controllers/note.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes are protected
router.use(protect);

// @route   POST /api/notes
// @desc    Create a new note
// @access  Private
router.post('/', createNote);

// @route   GET /api/notes/apartment/:apartmentId
// @desc    Get notes for a specific apartment
// @access  Private
router.get('/apartment/:apartmentId', getApartmentNotes);

// @route   DELETE /api/notes/:id
// @desc    Delete note
// @access  Private
router.delete('/:id', deleteNote);

module.exports = router;
