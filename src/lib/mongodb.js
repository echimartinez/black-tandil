import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Por favor, define la variable MONGODB_URI en tu archivo .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      // Reduce el tiempo de handshake inicial con Atlas
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      // Mantiene la conexión viva entre requests
      maxPoolSize: 10,
      minPoolSize: 1,
      // Evita reconexiones innecesarias en dev con hot reload
      bufferCommands: false,
    }).then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;