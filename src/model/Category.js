import mongoose from 'mongoose';

const SubCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
});

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  highlight: { type: Boolean, default: false },
  subcategories: [SubCategorySchema],
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);