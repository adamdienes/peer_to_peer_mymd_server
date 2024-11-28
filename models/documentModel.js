const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    magnetLink: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const Document = mongoose.model("Document", documentSchema);

exports.createDocument = async (documentData) => {
    const document = new Document(documentData);
    return await document.save();
};

exports.findDocumentsByUser = async (userId) => {
    return await Document.find({ userId });
};
