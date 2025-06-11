import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
  link: { type: mongoose.Schema.Types.ObjectId, ref: 'Link', required: true },
  email: { type: String },
  birthDay: { type: Object },
  visitedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Email', emailSchema);