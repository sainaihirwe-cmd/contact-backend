import mongoose from 'mongoose';

const loginSchema = new mongoose.Schema({
  email: { type: String, required: true },
  success: { type: Boolean, default: false },
  ip: { type: String },
}, { timestamps: true });

export default mongoose.model('LoginAttempt', loginSchema);
