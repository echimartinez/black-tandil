import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // null si se registró con Google
  image: { type: String },
  provider: { type: String, default: 'credentials' }, // 'credentials' | 'google'
  address: {
    street: String,
    city: String,
    province: String,
    postalCode: String,
    phone: String,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);