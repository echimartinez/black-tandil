import mongoose from 'mongoose';

const PurchaseItemSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  category:   { type: String, default: '' },
  size:       { type: String, default: '' },
  quantity:   { type: Number, required: true, min: 1 },
  unitCost:   { type: Number, required: true, min: 0 },
  subtotal:   { type: Number, required: true },
});

const PurchaseSchema = new mongoose.Schema({
  supplier:       { type: String, required: true },
  date:           { type: Date, required: true },
  reference:      { type: String, default: '' },
  items:          [PurchaseItemSchema],
  // Extras del lote
  packagingUnit:  { type: Number, default: 0 }, // packaging por unidad
  shipping:       { type: Number, default: 0 }, // flete total del lote
  otherExtras:    { type: Number, default: 0 },
  // Totales calculados
  subtotalItems:  { type: Number, default: 0 }, // suma de subtotales sin extras
  totalAmount:    { type: Number, default: 0 }, // total con todo incluido
  totalUnits:     { type: Number, default: 0 },
  avgUnitCost:    { type: Number, default: 0 }, // costo unitario promedio real
  suggestedPrice: { type: Number, default: 0 }, // avgUnitCost * 2.5
  notes:          { type: String, default: '' },
  createdAt:      { type: Date, default: Date.now },
});

export default mongoose.models.Purchase || mongoose.model('Purchase', PurchaseSchema);
