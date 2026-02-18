const mongoose = require('mongoose');

const EntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: String,
      required: true,
      // ❌ Remove unique: true from here
    },
    weight: Number,
    caloriesIn: Number,
    caloriesOut: Number,
    caloriesReduced: Number,
    protein: Number,
  },
  { timestamps: true }
);

// ✅ Add this line to ensure one entry per date PER USER
EntrySchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Entry', EntrySchema);