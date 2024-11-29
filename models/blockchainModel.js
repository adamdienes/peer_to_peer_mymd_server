const mongoose = require("mongoose");
const { generateHash } = require("../utils/hashUtil");

const blockchainSchema = new mongoose.Schema({
    index: { type: Number, required: true },
    timestamp: { type: Date, required: true },
    operation: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    details: { type: Object, required: false },
    blockHash: { type: String, required: false },
    previousHash: { type: String, required: true },
});

blockchainSchema.pre("save", function (next) {
    if (!this.blockHash) {
        this.blockHash = generateHash({
            index: this.index,
            timestamp: this.timestamp,
            operation: this.operation,
            userId: this.userId,
            details: this.details,
            previousHash: this.previousHash,
        });
    }
    next();
});

const Blockchain = mongoose.model("Blockchain", blockchainSchema);

module.exports = Blockchain;
