const Blockchain = require("../models/blockchainModel");
const { generateHash } = require("../utils/hashUtil");

exports.validateBlockchain = async (req, res) => {
    try {
        const blocks = await Blockchain.find().sort({ index: 1 });

        if (blocks.length === 0) {
            return res
                .status(200)
                .json({ message: "Blockchain is valid (empty)." });
        }

        for (let i = 1; i < blocks.length; i++) {
            const currentBlock = blocks[i];
            const previousBlock = blocks[i - 1];

            const currentBlockData = {
                index: currentBlock.index,
                timestamp: currentBlock.timestamp,
                operation: currentBlock.operation,
                userId: currentBlock.userId,
                details: currentBlock.details,
                previousHash: currentBlock.previousHash,
            };

            const calculatedHash = generateHash(currentBlockData);
            if (currentBlock.blockHash !== calculatedHash) {
                return res.status(400).json({
                    message: "Blockchain is invalid.",
                    reason: `Block ${currentBlock.index} has a hash mismatch.`,
                    block: currentBlock,
                });
            }

            if (currentBlock.previousHash !== previousBlock.blockHash) {
                return res.status(400).json({
                    message: "Blockchain is invalid.",
                    reason: `Block ${currentBlock.index} has a broken link to previous block.`,
                    block: currentBlock,
                });
            }
        }

        res.status(200).json({
            message: "Blockchain is valid.",
            length: blocks.length,
        });
    } catch (error) {
        console.error("Error validating blockchain:", error.message);
        res.status(500).json({ error: "Error validating the blockchain." });
    }
};
