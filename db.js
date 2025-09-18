const mongoose = require("mongoose");

const connectDB = async (uri) => {
    try {
        await mongoose.connect(uri);
        console.log("MongoDB Connected Successfully!");
        return true; // Indicate successful connection
    } catch (err) {
        console.error("Error Connecting to MongoDB:", err.message);
        // Do not exit here, let server.js handle the exit based on this promise's rejection
        throw err; // Re-throw the error so server.js can catch it
    }
};

module.exports = connectDB;