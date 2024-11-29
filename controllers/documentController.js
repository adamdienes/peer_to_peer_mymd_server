require("dotenv").config();

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
    createDocument,
    findDocumentsByUser,
} = require("../models/documentModel");
const { logOperation } = require("./blockchainController");
const User = require("../models/userModel");
const Document = require("../models/documentModel");
const { findUserById } = require("../models/userModel");

const SECRET_KEY = process.env.SECRET_KEY;

// Upload a document
exports.uploadDocument = async (req, res) => {
    const token = req.headers["authorization"];

    if (!token)
        return res.status(403).json({ error: "Authorization token required" });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        if (!decoded.id)
            return res
                .status(403)
                .json({ error: "Invalid authorization token" });

        const user = await User.findUserById(decoded.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (user.credits < 1)
            return res.status(403).json({
                error: "Insufficient credits to upload",
                credits: user.credits,
            });

        const { data } = req.body;
        if (!data)
            return res.status(400).json({ error: "Data required in body" });

        // TODO: Implement the logic to create a magnet link
        const magnetLink = data;

        const document = await createDocument({
            userId: decoded.id,
            magnetLink,
        });

        await logOperation("Document Upload", decoded.id, {
            data,
            magnetLink,
        });

        // decrement user credits
        user.credits -= 1;
        await user.save();

        await logOperation("User Credit Decrement", decoded.id, {
            amount: 1,
            remainingCredits: user.credits,
        });

        res.status(201).json({ magnetLink, credits: user.credits - 1 });
    } catch (error) {
        res.status(403).json({ error: "Invalid token or upload failed" });
        console.error(error);
    }
};

// Download a document
exports.downloadDocument = async (req, res) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    const { documentId } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ error: "User not found" });
        if (user.credits < 1)
            return res.status(403).json({ error: "Insufficient credits" });

        const document = await Document.findById(documentId);
        if (!document)
            return res.status(404).json({ error: "Document not found" });

        const uploader = await User.findById(document.userId);
        if (!uploader)
            return res.status(404).json({ error: "Uploader not found" });

        user.credits -= 1;
        uploader.credits += 1;

        await user.save();
        await uploader.save();

        await logOperation("Document Download", user._id, {
            documentId,
            uploaderId: uploader._id,
        });

        res.status(200).json({ message: "Download successful" });
    } catch (error) {
        res.status(403).json({ error: "Invalid token or download failed" });
        console.error(error);
    }
};

// Get all documents
exports.getDocuments = async (req, res) => {
    const token = req.headers["authorization"];

    if (!token)
        return res.status(403).json({ error: "Authorization token required" });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const documents = await findDocumentsByUser(decoded.id);
        await logOperation(`Documents retrieved by user ${decoded.id}`);
        res.status(200).json({
            torrents: documents.map((doc) => ({
                id: doc._id,
                magnet_link: doc.magnetLink,
                upload_date: doc.timestamp,
                category: doc.category || "Movie",
                size: doc.size || "155",
            })),
        });
    } catch (error) {
        res.status(403).json({ error: "Invalid token or retrieval failed" });
        console.error(error);
    }
};
