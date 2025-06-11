import linkModel from '../models/link.model.js';
import emailModel from '../models/email.model.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Get total number of links (advertisements)
    const totalLinks = await linkModel.countDocuments();

    // Get total visits across all links
    const linksWithVisits = await linkModel.find({}, 'visits');
    const totalVisits = linksWithVisits.reduce((sum, link) => sum + (link.visits || 0), 0);

    // Get total unique emails collected
    const totalEmails = await emailModel.countDocuments();

    // Get recent links (last 5)
    const recentLinks = await linkModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('slug destinationUrl visits createdAt');

    // Get top performing links (top 5 by visits)
    const topLinks = await linkModel
      .find()
      .sort({ visits: -1 })
      .limit(10)
      .select('slug destinationUrl visits');

    // Get recent emails (last 5)
    const recentEmails = await emailModel
      .find()
      .sort({ visitedAt: -1 })
      .limit(10)
      .populate('link', 'slug')
      .select('email visitedAt');

    res.json({
      totalLinks,
      totalVisits,
      totalEmails,
      recentLinks,
      topLinks,
      recentEmails
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ error: 'Error fetching dashboard statistics' });
  }
}; 