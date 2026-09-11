import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0, default: 0 },
  category: { type: String, required: true, trim: true },
  image: { type: String, required: false },
  
  // User tracking
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdByName: { type: String, required: true },
  createdByRole: { type: String, enum: ['user', 'admin'], required: true },
  
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedByName: { type: String },
  updatedByRole: { type: String, enum: ['user', 'admin'] },
  
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedByName: { type: String },
  deletedAt: { type: Date },
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
