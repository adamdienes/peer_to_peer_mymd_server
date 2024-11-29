const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: { type: String, required: true },
    magnetLink: { type: String, required: true },
    size: { type: Number, required: true },
    category: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const Document = mongoose.model("Document", documentSchema);

const createDocument = async (documentData) => {
    const document = new Document(documentData);
    return await document.save();
};

const findDocumentsByUser = async (userId) => {
    return await Document.find({ userId }).sort({ timestamp: -1 });
};

const getAllDocuments = async () => {
    return await Document.find().sort({ timestamp: -1 });
};

const findDocumentById = async (documentId) => {
    return await Document.findById(documentId);
};

module.exports = {
    Document,
    createDocument,
    findDocumentsByUser,
    getAllDocuments,
    findDocumentById,
};
