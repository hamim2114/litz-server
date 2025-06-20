import mongoose from 'mongoose';

const followUpSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  link: { type: mongoose.Schema.Types.ObjectId, ref: 'Link', required: true },
  enabled: { type: Boolean },
  approved: { type: Boolean, default: false },
  subject: { type: String },
  message: { type: String },
  delayInHours: { type: Number },
}, { timestamps: true });

export default mongoose.model('FollowUp', followUpSchema);