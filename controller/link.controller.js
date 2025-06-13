import linkModel from '../models/link.model.js';
import emailModel from '../models/email.model.js';
import { Parser } from 'json2csv';
import { createError } from '../middleware/error.handler.js';

export const createLink = async (req, res, next) => {
  const { slug, destinationUrl, googleLogin, type, isActive, image } = req.body;
  try {
    const link = new linkModel({ slug, destinationUrl, googleLogin, type, isActive, image, user: req.user.id });
    await link.save();
    res.status(201).send({message: 'Link created successfully'});
  } catch (error) {
    if (error.code === 11000) {
      return next(createError(400, {slug: 'Slug already exists'}));
    }
    next(error);
  }
};

export const getAllLinks = async (req, res) => {
  const { search, status, company } = req.query;
  let query = {};

  if (req.user.role === 'user') {
    query.user = req.user.id;
  }

  if (search) {
    query.slug = { $regex: search, $options: 'i' };
  }

  if (status) {
    query.isActive = status === 'active';
  }

  if (company && req.user.role === 'admin') {
    query.user = company;
  }

  let links;
  if (req.user.role === 'user') {
    links = await linkModel.find(query).sort({ createdAt: -1 });
  }
  if (req.user.role === 'admin') {
    links = await linkModel.find(query).sort({ createdAt: -1 }).populate('user');
  }
  
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
      type: link.type,
      isActive: link.isActive,
      image: link.image,
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
    const link = await linkModel.findByIdAndUpdate(id, req.body, { new: true ,runValidators: true});
    if (!link) return res.status(404).send({message: 'Link not found'});
    res.send({message: 'Link updated successfully'});
  } catch (error) {
    if (error.code === 11000) {
      return next(createError(400, {slug: 'Slug already exists'}));
    }
    next(error);
  }
};

export const deleteLink = async (req, res, next) => {
  const { id } = req.params;
  try {
    const link = await linkModel.findByIdAndDelete(id);
    if (!link) return res.status(404).send({message: 'Link not found'});
    
    // Delete all emails associated with this link
    // await emailModel.deleteMany({ link: id });
    
    res.send({message: 'Link deleted successfully'});
  } catch (err) {
    next(err);
  }
};
