import mongoose from 'mongoose';

const followUpSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  link: { type: mongoose.Schema.Types.ObjectId, ref: 'Link', required: true },
  enabled: { type: Boolean, default: false },
  approved: { type: Boolean, default: false },
  subject: { type: String },
  message: { type: String },
  img: { type: String },
  destinationUrl: { type: String },
  
  // Casual follow-up fields
  delayInMinutes: { type: Number, default: 0 },
  
  // Scheduled follow-up fields
  followUpType: { 
    type: String, 
    enum: ['casual', 'scheduled'], 
    default: 'casual' 
  },
  scheduledTime: { type: String }, // Format: "HH:MM" (e.g., "20:00" for 8pm)
  scheduledFrequency: { 
    type: String, 
    enum: ['daily', 'weekly'], 
    default: 'daily' 
  },
  scheduledDayOfWeek: { 
    type: Number, 
    min: 0, 
    max: 6, 
    default: 0 
  }, // 0 = Sunday, 1 = Monday, etc. (for weekly frequency)
}, { 
  timestamps: true,
  index: { user: 1, link: 1 },
  unique: true 
});

export default mongoose.model('FollowUp', followUpSchema);