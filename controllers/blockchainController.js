const { logAction } = require("../models/blockchainModel");
const crypto = require("crypto");

exports.logToBlockchain = async (action, user) => {
    const token = crypto.randomBytes(32).toString("hex");
    await logAction(action, user, token);
    console.log("Logged to blockchain: ", action);
    return token;
};
