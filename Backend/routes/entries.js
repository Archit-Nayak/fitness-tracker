const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');
const { protect } = require('../middleware/authMiddleware');

// GET all entries (NOW PROTECTED)
router.get('/', protect, async (req, res) => {
  // 🔑 Only find entries where user matches the logged-in user ID
  const entries = await Entry.find({ user: req.user }).sort({ date: -1 });
  res.json(entries);
});

// POST new entry (NOW PROTECTED)
router.post("/", protect, async (req, res) => {
  try {
    const updatedEntry = await Entry.findOneAndUpdate(
      { 
        date: req.body.date, 
        user: req.user // 🔑 Ensure we update the entry for THIS user
      }, 
      { 
        ...req.body, 
        user: req.user // 🔑 Attach the user ID to the document
      }, 
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.json(updatedEntry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE entry (NOW PROTECTED)
router.delete('/:id', protect, async (req, res) => {
  // 🔑 Find by ID AND User to prevent deleting someone else's data
  const entry = await Entry.findOneAndDelete({ _id: req.params.id, user: req.user });
  
  if (!entry) {
    return res.status(404).json({ message: 'Entry not found or unauthorized' });
  }
  
  res.json({ message: 'Entry deleted' });
});

module.exports = router;