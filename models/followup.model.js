import mongoose from 'mongoose';

const followUpSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  link: { type: mongoose.Schema.Types.ObjectId, ref: 'Link', required: true },
  enabled: { type: Boolean, default: false },
  approved: { type: Boolean, default: false },
  subject: { type: String },
  message: { type: String },
  delayInMinutes: { type: Number, default: 0 },
}, { 
  timestamps: true,
  index: { user: 1, link: 1 },
  unique: true 
});

export default mongoose.model('FollowUp', followUpSchema);