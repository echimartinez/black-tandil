import mongoose from 'mongoose';

const PurchaseItemSchema = new mongoose.Schema({
  name:           { type: String, required: true },
  category:       { type: String, default: '' },
  size:           { type: String, default: '' },
  quantity:       { type: Number, required: true, min: 1 },
  unitCost:       { type: Number, required: true, min: 0 },
  subtotal:       { type: Number, required: true },
  // Costo real por unidad (incluye parte proporcional del flete y packaging)
  costoRealUnit:  { type: Number, default: 0 },
  // Precio de venta sugerido = costoRealUnit * 2.5
  precioSugerido: { type: Number, default: 0 },
});

const PurchaseSchema = new mongoose.Schema({
  supplier:      { type: String, required: true },
  date:          { type: Date, required: true },
  reference:     { type: String, default: '' },
  items:         [PurchaseItemSchema],
  packagingUnit: { type: Number, default: 0 },
  shipping:      { type: Number, default: 0 },
  otherExtras:   { type: Number, default: 0 },
  subtotalItems: { type: Number, default: 0 },
  totalAmount:   { type: Number, default: 0 },
  totalUnits:    { type: Number, default: 0 },
  avgUnitCost:   { type: Number, default: 0 }, // solo referencia del lote
  notes:         { type: String, default: '' },
  createdAt:     { type: Date, default: Date.now },
});

export default mongoose.models.Purchase || mongoose.model('Purchase', PurchaseSchema);
