import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    img: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/.+@.+\..+/, 'Please enter a valid email address']
    },
    role: { type: String, enum: ["admin", "user"], default: "user", },
    password: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);
