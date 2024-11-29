const Blockchain = require("../models/blockchainModel");
const { generateHash } = require("../utils/hashUtil");

exports.logOperation = async (operation, userId, details) => {
    try {
        // Find the last block in the chain (the latest one)
        const previousBlock = await Blockchain.findOne().sort({ index: -1 });

        // Set the previousHash to the last block's blockHash or "0" if no blocks exist
        const previousHash = previousBlock ? previousBlock.blockHash : "0";

        // Prepare data for the new block
        const newBlockData = {
            index: previousBlock ? previousBlock.index + 1 : 0,
            timestamp: new Date(),
            operation,
            details,
            userId,
            previousHash,
        };

        // Create and save the new block (blockHash will be auto-generated in the model)
        const newBlock = new Blockchain(newBlockData);
        await newBlock.save();

        console.log("Blockchain updated:", newBlock);
    } catch (error) {
        console.error("Error logging to blockchain:", error.message);
    }
};
