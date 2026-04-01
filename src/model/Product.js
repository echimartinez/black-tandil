import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, default: null }, // precio antes del descuento
  image: { type: String, required: true },
  images: [String],
  category: { type: String, default: 'Camisacos' },
  description: String,
  longDescription: String,
  benefits: [String],
  details: [{ label: String, value: String }],
  sizes: [String],
  stockBySize: { type: Map, of: Number },
  active: { type: Boolean, default: true },
  sale: { type: Boolean, default: false },       // en oferta
  isNew: { type: Boolean, default: false },      // novedad
  featured: { type: Boolean, default: false },   // destacado en home
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);