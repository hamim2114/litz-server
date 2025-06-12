import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    slug: { type: String, required: true, unique: true, trim: true , validate: {
      validator: async function(slug) {
        const link = await this.constructor.findOne({ slug });
        return !link || link._id.equals(this._id);
      },
      message: 'Slug must be unique'
    }},
    image: { type: String },
    destinationUrl: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['catálogo', 'anuncio', 'promoción']},
    visits: { type: Number, default: 0 },
    googleLogin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Link', linkSchema);
