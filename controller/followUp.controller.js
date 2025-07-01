import followupModel from '../models/followup.model.js';

export const requestFollowUp = async (req, res) => {
  const { 
    link, 
    enabled, 
    approved, 
    subject, 
    message, 
    delayInMinutes, 
    img, 
    destinationUrl,
    followUpType,
    scheduledTime,
    scheduledFrequency,
    scheduledDayOfWeek
  } = req.body;

  //if already exist in the database
  const existingFollowUp = await followupModel.findOne({ link });
  if (existingFollowUp) {
    return res.status(400).json({ slug: 'Follow-up already exists' });
  }

  // Validate casual follow-up fields
  if (followUpType === 'casual' || !followUpType) {
    if (delayInMinutes < 0 || delayInMinutes > 1440) {
      return res.status(400).json({ delayInMinutes: 'Delay must be between 0 and 1440 minutes' });
    }
  }

  // Validate scheduled follow-up fields
  if (followUpType === 'scheduled') {
    if (!scheduledTime) {
      return res.status(400).json({ scheduledTime: 'Scheduled time is required for scheduled follow-ups' });
    }
    
    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(scheduledTime)) {
      return res.status(400).json({ scheduledTime: 'Time must be in HH:MM format (e.g., 20:00)' });
    }

    if (!scheduledFrequency || !['daily', 'weekly'].includes(scheduledFrequency)) {
      return res.status(400).json({ scheduledFrequency: 'Frequency must be either "daily" or "weekly"' });
    }

    if (scheduledFrequency === 'weekly') {
      if (scheduledDayOfWeek === undefined || scheduledDayOfWeek < 0 || scheduledDayOfWeek > 6) {
        return res.status(400).json({ scheduledDayOfWeek: 'Day of week must be between 0 (Sunday) and 6 (Saturday)' });
      }
    }
  }

  const followUp = new followupModel({
    user: req.user.id,
    link,
    enabled,
    approved,
    subject,
    message,
    delayInMinutes,
    img,
    destinationUrl,
    followUpType: followUpType || 'casual',
    scheduledTime,
    scheduledFrequency,
    scheduledDayOfWeek,
  });

  await followUp.save();

  // Notify admin
  // await sendEmail({
  //   to: process.env.ADMIN_EMAIL,
  //   subject: 'New Follow-Up Email Request',
  //   text: `Follow-up requested for Link ID: ${linkId}`
  // });

  res
    .status(201)
    .json({ message: 'Follow-up Created.' });
};


export const getAllFollowUps = async (req, res) => {
  const { slug, status } = req.query;
  let query = {};

  // Add user filter based on role
  if (req.user.role === 'user') {
    query.user = req.user.id;
  }

  // Add status filter if provided
  if (status) {
    if (status === 'active') {
      query.enabled = true;
    } else if (status === 'inactive') {
      query.enabled = false;
    }
  }

  // Get followups with optional slug filter
  const followUps = await followupModel
    .find(query)
    .sort({ createdAt: -1 })
    .populate({
      path: 'link',
      match: slug ? { slug: slug } : {},
      select: 'slug'
    })
    .populate(req.user.role === 'admin' ? 'user' : '');

  // Filter out followups where link doesn't match slug
  const filteredFollowUps = slug 
    ? followUps.filter(followUp => followUp.link)
    : followUps;

  res.json(filteredFollowUps);
};

export const getFollowUpById = async (req, res) => {
  const { id } = req.params;
  const followUp = await followupModel.findById(id);
  res.json(followUp);
};

export const updateFollowUp = async (req, res) => {
  const { id } = req.params;
  const { 
    link, 
    approved, 
    enabled, 
    subject, 
    message, 
    delayInMinutes, 
    img, 
    destinationUrl,
    followUpType,
    scheduledTime,
    scheduledFrequency,
    scheduledDayOfWeek
  } = req.body;

  // Validate casual follow-up fields
  if (followUpType === 'casual' || !followUpType) {
    if (delayInMinutes !== undefined && (delayInMinutes < 0 || delayInMinutes > 1440)) {
      return res.status(400).json({ delayInMinutes: 'Delay must be between 0 and 1440 minutes' });
    }
  }

  // Validate scheduled follow-up fields
  if (followUpType === 'scheduled') {
    if (!scheduledTime) {
      return res.status(400).json({ scheduledTime: 'Scheduled time is required for scheduled follow-ups' });
    }
    
    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(scheduledTime)) {
      return res.status(400).json({ scheduledTime: 'Time must be in HH:MM format (e.g., 20:00)' });
    }

    if (!scheduledFrequency || !['daily', 'weekly'].includes(scheduledFrequency)) {
      return res.status(400).json({ scheduledFrequency: 'Frequency must be either "daily" or "weekly"' });
    }

    if (scheduledFrequency === 'weekly') {
      if (scheduledDayOfWeek === undefined || scheduledDayOfWeek < 0 || scheduledDayOfWeek > 6) {
        return res.status(400).json({ scheduledDayOfWeek: 'Day of week must be between 0 (Sunday) and 6 (Saturday)' });
      }
    }
  }

  const followUp = await followupModel.findByIdAndUpdate(
    id,
    { 
      link, 
      approved, 
      enabled, 
      subject, 
      message, 
      delayInMinutes, 
      img, 
      destinationUrl,
      followUpType,
      scheduledTime,
      scheduledFrequency,
      scheduledDayOfWeek
    },
    { new: true }
  );
  if (!followUp)
    return res.status(404).json({ message: 'Follow-up not found' });
  res.json({ message: 'Follow-up updated.' });
};

export const deleteFollowUp = async (req, res) => {
  const { id } = req.params;
  const followUp = await followupModel.findByIdAndDelete(id);
  if (!followUp)
    return res.status(404).json({ message: 'Follow-up not found' });
  res.json({ message: 'Follow-up deleted.' });
};
