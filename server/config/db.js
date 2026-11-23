import mongoose from 'mongoose';

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/arkham_adventure';
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log(`[db] connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
}

export default connectDB;
