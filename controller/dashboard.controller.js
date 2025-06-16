import linkModel from '../models/link.model.js';
import emailModel from '../models/email.model.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Get total number of links (advertisements) for this user
    const totalLinks = await linkModel.countDocuments({ user: req.user.id });

    // Get total visits across all links for this user
    const linksWithVisits = await linkModel.find({ user: req.user.id }, 'visits');
    const totalVisits = linksWithVisits.reduce((sum, link) => sum + (link.visits || 0), 0);

    // Get total unique emails collected from this user's links
    const userLinks = await linkModel.find({ user: req.user.id }).select('_id');
    const userLinkIds = userLinks.map(link => link._id);
    const totalEmails = await emailModel.countDocuments({ link: { $in: userLinkIds } });

    // Get recent links (last 10) for this user
    const recentLinks = await linkModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('slug destinationUrl visits createdAt');

    // Get top performing links (top 10 by visits) for this user
    const topLinks = await linkModel
      .find({ user: req.user.id })
      .sort({ visits: -1 })
      .limit(10)
      .select('slug destinationUrl visits');

    // Get recent emails (last 10) from this user's links
    const recentEmails = await emailModel
      .find({ link: { $in: userLinkIds } })
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