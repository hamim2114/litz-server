import linkModel from '../models/link.model.js';
import emailModel from '../models/email.model.js';
import { Parser } from 'json2csv';

export const createLink = async (req, res, next) => {
  const { slug, destinationUrl, googleLogin } = req.body;
  try {
    const link = new linkModel({ slug, destinationUrl, googleLogin });
    await link.save();
    res.status(201).send('Link created successfully');
  } catch (err) {
    next(err);
  }
};

export const getAllLinks = async (req, res) => {
  const links = await linkModel.find().sort({ createdAt: -1 });
  
  const linksWithEmailCounts = await Promise.all(
    links.map(async (link) => {
      const emailCount = await emailModel.countDocuments({ link: link._id });
      return {
        ...link.toObject(),
        emailCount
      };
    })
  );

  res.json(linksWithEmailCounts);
};


export const getLinkBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { from, to, exportAs } = req.query;

    const link = await linkModel.findOne({ slug });
    if (!link) return res.status(404).send('Link not found');
   
    // Build query filter
    const filter = { link: link._id };
    if (from || to) {
      filter.visitedAt = {};
      if (from) filter.visitedAt.$gte = new Date(from);
      if (to) filter.visitedAt.$lte = new Date(to);
    }

    const emails = await emailModel.find(filter).sort({ visitedAt: -1 });

    const emailList = emails.map((v) => ({
      email: v.email,
      birthDay: v.birthDay,
      visitedAt: v.visitedAt,
    }));

    if (exportAs === 'csv') {
      const csvFields = ['email', 'visitedAt', 'birthDay'];
      const parser = new Parser({ fields: csvFields });
      const csv = parser.parse(emailList);

      res.header('Content-Type', 'text/csv');
      res.attachment(`${slug}_visits.csv`);
      return res.send(csv);
    }


    return res.json({
      _id: link._id,
      slug: link.slug,
      destinationUrl: link.destinationUrl,
      visits: link.visits,
      googleLogin: link.googleLogin,
      emailList,
      createdAt: link.createdAt,
    });
  } catch (err) {
    console.error('Error:', err);
    next(err);
  }
};

export const updateLink = async (req, res, next) => {
  const { id } = req.params;
  try {
    const link = await linkModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!link) return res.status(404).send('Link not found');
    res.send('Link updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteLink = async (req, res, next) => {
  const { id } = req.params;
  try {
    const link = await linkModel.findByIdAndDelete(id);
    if (!link) return res.status(404).send('Link not found');
    
    // Delete all emails associated with this link
    await emailModel.deleteMany({ link: id });
    
    res.send('Link deleted successfully');
  } catch (err) {
    next(err);
  }
};
