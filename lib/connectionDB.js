const mongoose = require("mongoose");

const connectionDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (err) {
    console.log(err);
  }
};
module.exports = connectionDB;
