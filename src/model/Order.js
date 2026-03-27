import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  external_reference: { type: String, required: true },
  title: String,
  amount: { type: Number, required: true },
  status: { type: String, default: "pending" },
  payment_id: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Guardamos los items completos para mostrar imágenes en el perfil
  items: [
    {
      name: String,
      size: String,
      quantity: Number,
      price: Number,
      image: String,
    }
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);