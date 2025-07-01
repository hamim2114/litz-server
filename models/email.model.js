import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
  link: { type: mongoose.Schema.Types.ObjectId, ref: 'Link', required: true },
  email: { type: String },
  visitedAt: { type: Date, default: Date.now },
  followUpSent: { type: Boolean },
  
  // Scheduled follow-up fields
  scheduledFollowUpSent: { type: Boolean, default: false },
  scheduledFollowUpDate: { type: Date }, // The date when this email should receive scheduled follow-up
}, { 
  timestamps: true 
});

export default mongoose.model('Email', emailSchema);