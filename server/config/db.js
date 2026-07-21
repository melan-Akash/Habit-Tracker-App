const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb+srv://nexion:5AikdQx4M2Vm04cQ@cluster0.tap0akb.mongodb.net/habit_tracker_db?retryWrites=true&w=majority';
  const fallbackLocalUri = 'mongodb://127.0.0.1:27017/habit_tracker_db';

  try {
    const conn = await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 4000 });
    console.log(`🟢 MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ Primary MongoDB Connection failed (${error.message}). Connecting to Local MongoDB fallback...`);
    try {
      const localConn = await mongoose.connect(fallbackLocalUri);
      console.log(`🟢 Connected to Fallback Local MongoDB: ${localConn.connection.host}`);
    } catch (localErr) {
      console.error(`🔴 Local MongoDB Connection Error: ${localErr.message}`);
    }
  }
};

module.exports = connectDB;
