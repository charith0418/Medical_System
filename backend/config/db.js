const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error(' MONGO_URI is not defined in environment variables!');
      process.exit(1);
    }

    console.log(' Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(' Database connection failed:');
    console.error(error.message || error);
    process.exit(1);
  }
};

module.exports = connectDB;