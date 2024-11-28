const mongoose = require("mongoose");

const blockchainSchema = new mongoose.Schema({
    action: { type: String, required: true },
    user: { type: String, required: true },
    token: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const Blockchain = mongoose.model("Blockchain", blockchainSchema);

exports.logAction = async (action, user, token) => {
    const log = new Blockchain({ action, user, token });
    return await log.save();
};
