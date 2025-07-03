import mongoose from 'mongoose';

const followUpSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  link: { type: mongoose.Schema.Types.ObjectId, ref: 'Link', required: true },
  enabled: { type: Boolean, default: false },
  approved: { type: Boolean, default: false },
  subject: { type: String, required: true },
  // message: { type: String },
  img: { type: String },
  destinationUrl: { type: String },

  // Type: 'casual' or 'scheduled'
  followUpType: { type: String, enum: ['casual', 'scheduled'], default: 'casual', required: true },

  // For casual
  delayInMinutes: { type: Number, default: 0 },

  // For scheduled
  scheduleType: { type: String, enum: ['daily', 'weekly', 'monthly'] },
  sendHour: { type: Number }, // 0-23 (hour of the day)

}, {
  timestamps: true
});

export default mongoose.model('FollowUp', followUpSchema);
