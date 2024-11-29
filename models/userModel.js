const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    credits: { type: Number, default: 20 },
    purchasedDocuments: [
        {
            documentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Document",
                required: true,
            },
        },
    ],
});

const User = mongoose.model("User", userSchema);

const findUserByUsername = async (username) => {
    return await User.findOne({ username });
};

const findUserbyEmail = async (email) => {
    return await User.findOne({ email });
};

const findUserById = async (id) => {
    return await User.findById(id);
};

const createUser = async (userData) => {
    const user = new User(userData);
    return await user.save();
};

const addPurchasedDocument = async (userId, document) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    user.purchasedDocuments.push(document);
    return await user.save();
};

module.exports = {
    User,
    findUserByUsername,
    findUserbyEmail,
    findUserById,
    createUser,
    addPurchasedDocument,
};
