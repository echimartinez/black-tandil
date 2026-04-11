import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['gasto_fijo', 'costo_produccion'],
    required: true,
  },
  category: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  // Solo para gastos fijos
  frequency: {
    type: String,
    enum: ['mensual', 'trimestral', 'semestral', 'anual'],
    default: 'mensual',
  },
  // Solo para costos de producción
  productName: { type: String, default: '' },
  costBreakdown: {
    material: { type: Number, default: 0 },
    estampado: { type: Number, default: 0 },
    confeccion: { type: Number, default: 0 },
    etiqueta: { type: Number, default: 0 },
    packaging: { type: Number, default: 0 },
    otros: { type: Number, default: 0 },
  },
  date: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
