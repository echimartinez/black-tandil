import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  external_reference: { type: String, required: true },
  title: String,
  amount: { type: Number, required: true }, // <--- Asegúrate que diga 'amount'
  status: { type: String, default: "pending" },
  payment_id: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);