require("dotenv").config();
const mongoose = require("mongoose");

exports.connectToDatabase = async () => {
    const uri = process.env.MONGO_URI;

    try {
        mongoose.set("strictQuery", false);
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error.message);
        process.exit(1);
    }
};
