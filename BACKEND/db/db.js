const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const env = process.env.MONGODB_URI;
console.log(env);
const db = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.log(err.message);
    }
};
module.exports = db;
