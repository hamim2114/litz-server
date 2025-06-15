import linkModel from '../models/link.model.js';
import emailModel from '../models/email.model.js';

export const recordEmail = async (req, res) => {
  try {
    const { slug } = req.params;
    const { email } = req.body;
    
    const link = await linkModel.findOne({ slug });
    if (!link) return res.status(404).send('Invalid slug');

    // Check if email already exists for this link
    // const existingEmail = await emailModel.findOne({ 
    //   link: link._id,
    //   email: email 
    // });

    // if (existingEmail) {
    //   return res.status(200).json({
    //     error: 'This email has already been registered for this link'
    //   });
    // }

    // Record new email
    const emailRecord = new emailModel({
      link: link._id,
      email: email
    });

    await emailRecord.save();
    return res.status(201).send('Email recorded');
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

export const getEmailsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const link = await linkModel.findOne({ slug });
    if (!link) return res.status(404).json({ error: 'Invalid slug' });
    
    const emails = await emailModel
      .find({ link: link._id })
      .sort({ visitedAt: -1 });
    
    return res.json(emails);
  } catch (error) {
    console.error('Error getting emails:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
