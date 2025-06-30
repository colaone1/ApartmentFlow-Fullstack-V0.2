const Note = require('../models/note.model');
const Apartment = require('../models/apartment.model');
const { asyncHandler } = require('../utils');

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
const createNote = asyncHandler(async (req, res) => {
  const { apartmentId, content } = req.body;

  // Validate apartment exists
  const apartment = await Apartment.findById(apartmentId);
  if (!apartment) {
    return res.status(404).json({
      success: false,
      message: 'Apartment not found',
    });
  }

  const note = await Note.create({
    user: req.user.id,
    apartment: apartmentId,
    content,
  });

  res.status(201).json({
    success: true,
    data: note,
  });
});

// @desc    Get all notes for an apartment for current user
// @route   GET /api/notes/apartment/:apartmentId
// @access  Private
const getApartmentNotes = asyncHandler(async (req, res) => {
  const { apartmentId } = req.params;
  const notes = await Note.find({ user: req.user.id, apartment: apartmentId }).sort('-createdAt');
  res.json({
    success: true,
    data: notes,
  });
});

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) {
    return res.status(404).json({
      success: false,
      message: 'Note not found',
    });
  }
  // Check ownership
  if (note.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this note',
    });
  }
  await note.deleteOne();
  res.json({
    success: true,
    message: 'Note deleted successfully',
  });
});

module.exports = {
  createNote,
  getApartmentNotes,
  deleteNote,
};
