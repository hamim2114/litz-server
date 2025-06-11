import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema({
  link: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Link',
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  visitedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure uniqueness of link and IP combination
visitSchema.index({ link: 1, ip: 1 }, { unique: true });

const Visit = mongoose.model('Visit', visitSchema);

export default Visit; 