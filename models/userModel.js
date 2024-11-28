const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

exports.createUser = async (userData) => {
    const user = new User(userData);
    return await user.save();
};

exports.findUserByUsername = async (username) => {
    return await User.findOne({ username });
};
