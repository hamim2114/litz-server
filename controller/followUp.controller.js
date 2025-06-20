  import followupModel from "../models/followup.model.js"

export const requestFollowUp = async (req, res) => {
  const { link, subject, message, delayInHours } = req.body;

  if (!link || !subject || !message || !delayInHours) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const user = req.user.id;

  //if already exist in the database
  const existingFollowUp = await followupModel.findOne({ link });
  if (existingFollowUp) {
    return res.status(400).json({ message: 'Follow-up already exists' });
  }

  const followUp = new followupModel({
    user,
    link,
    enabled: false,
    approved: false,
    subject,
    message,
    delayInHours
  });

  await followUp.save();

  // Notify admin
  // await sendEmail({
  //   to: process.env.ADMIN_EMAIL,
  //   subject: 'New Follow-Up Email Request',
  //   text: `Follow-up requested for Link ID: ${linkId}`
  // });

  res.status(201).json({ message: 'Follow-up request submitted and pending approval.' });
};

export const approveFollowUp = async (req, res) => {
  const { id } = req.params;
  const followUp = await followupModel.findByIdAndUpdate(id, { approved: true, enabled: true }, { new: true });
  if (!followUp) return res.status(404).json({ message: 'Follow-up not found' });
  res.json({ message: 'Follow-up approved and enabled.' });
};

export const cancelFollowUp = async (req, res) => {
  const { id } = req.params;
  const followUp = await followupModel.findByIdAndUpdate(id, { enabled: false, approved: false }, { new: true });
  if (!followUp) return res.status(404).json({ message: 'Follow-up not found' });
  res.json({ message: 'Follow-up cancelled.' });
};

export const getAllFollowUps = async (req, res) => {

  if (req.user.role === 'admin') {
    const followUps = await followupModel.find().sort({ createdAt: -1 }).populate('link').populate('user');
    res.json(followUps);
  } 
  if (req.user.role === 'user') {
    const followUps = await followupModel.find({ user: req.user.id }).sort({ createdAt: -1 }).populate('link');
    res.json(followUps);
  }
};

export const getFollowUpById = async (req, res) => {
  const { id } = req.params;
  const followUp = await followupModel.findById(id);
  res.json(followUp);
};

export const updateFollowUp = async (req, res) => {
  const { id } = req.params;
  const { enabled, approved } = req.body;
  const followUp = await followupModel.findByIdAndUpdate(id, { enabled, approved }, { new: true });
  res.json(followUp);
};

export const deleteFollowUp = async (req, res) => {
  const { id } = req.params;
  const followUp = await followupModel.findByIdAndDelete(id);
  if (!followUp) return res.status(404).json({ message: 'Follow-up not found' });
  res.json({ message: 'Follow-up deleted.' });
};


