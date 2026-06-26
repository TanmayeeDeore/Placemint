const mongoose = require('mongoose');//require mongose so that it help connecct node with mongodb 

const connectDB = async () => { // create a async fun because connect to db requires time 
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI); //wait until mongodb is connected then continue
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

