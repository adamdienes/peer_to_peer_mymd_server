const Blockchain = require("../models/blockchainModel");

exports.logOperation = async (operation, userId, details) => {
    try {
        const previousBlock = await Blockchain.findOne().sort({ index: -1 });

        const previousHash = previousBlock ? previousBlock.blockHash : "0";

        const newBlockData = {
            index: previousBlock ? previousBlock.index + 1 : 0,
            timestamp: new Date(),
            operation,
            details,
            userId,
            previousHash,
        };

        const newBlock = new Blockchain(newBlockData);
        await newBlock.save();

        console.log("Blockchain updated:", newBlock);
    } catch (error) {
        console.error("Error logging to blockchain:", error.message);
    }
};
