import linkModel from '../models/link.model.js';
import visitModel from '../models/visit.model.js';

//record unique visits
export const recordVisit = async (req, res) => {
  try {
    const { slug } = req.params;
    const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    
    const link = await linkModel.findOne({ slug });
    if (!link) return res.status(404).send('Invalid slug');

    // Try to create a unique visit record
    try {
      const visit = new visitModel({
        link: link._id,
        ip: ip
      });
      await visit.save();
      
      // Only increment link visits if this is a new unique visit
      link.visits = link.visits + 1;
      await link.save();
      
      return res.status(200).json({ recorded: true, unique: true });
    } catch (duplicateError) {
      // If it's a duplicate key error (same IP visiting same link), don't increment
      if (duplicateError.code === 11000) {
        return res.status(200).json({ recorded: false, unique: false, message: 'Visit already recorded for this IP' });
      }
      throw duplicateError;
    }
  } catch (error) {
    console.error('Error recording visit:', error);
    return res.status(500).send('Internal server error');
  }
};

//record all visits
// export const recordVisit = async (req, res) => {
//   try {
//     const { slug } = req.params;
    
//     const link = await linkModel.findOne({ slug });
//     if (!link) return res.status(404).send('Invalid slug');

//     link.visits = link.visits + 1;
//     await link.save();

//     return res.status(200).json({ recorded: true });
//   } catch (error) {
//     console.error('Error recording visit:', error);
//     return res.status(500).send('Internal server error');
//   }
// };

export const getVisitsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const link = await linkModel.findOne({ slug });
    if (!link) return res.status(404).json({ error: 'Invalid slug' });

    const visits = await visitModel
      .find({ link: link._id })
      .sort({ visitedAt: -1 });

    return res.json({
      totalVisits: link.visits,
      visits: visits,
    });
  } catch (error) {
    console.error('Error getting visits:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
