import followupModel from '../models/followup.model.js';

export const requestFollowUp = async (req, res) => {
  const { link,enabled,approved, subject, message, delayInMinutes, img } = req.body;

  //if already exist in the database
  const existingFollowUp = await followupModel.findOne({ link });
  if (existingFollowUp) {
    return res.status(400).json({ slug: 'Follow-up already exists' });
  }

  //delay in hours must be between 1 and 72
  if (delayInMinutes < 0 || delayInMinutes > 1440) {
    return res.status(400).json({ delayInMinutes: 'Delay must be between 0 and 1440 minutes' });
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
    if (status === 'enabled') {
      query.enabled = true;
    } else if (status === 'disabled') {
      query.enabled = false;
    } else if (status === 'approved') {
      query.approved = true;
    } else if (status === 'pending') {
      query.approved = false;
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
  const { link, approved, enabled, subject, message, delayInMinutes } = req.body;

  if (delayInMinutes) {
    if (delayInMinutes < 0 || delayInMinutes > 1440) {
      return res.status(400).json({ delayInMinutes: 'Delay must be between 0 and 1440 minutes' });
    }
  }

  const followUp = await followupModel.findByIdAndUpdate(
    id,
    { link, approved, enabled, subject, message, delayInMinutes },
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
