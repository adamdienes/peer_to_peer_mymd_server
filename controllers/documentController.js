require("dotenv").config();

const jwt = require("jsonwebtoken");
const { createDocument } = require("../models/documentModel");
const { logOperation } = require("./blockchainController");
const User = require("../models/userModel");
const Document = require("../models/documentModel");
const { findUserById } = require("../models/userModel");
const {
    getAllDocuments,
    findDocumentById,
} = require("../models/documentModel");

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

        const { title, magnet_link, size, category } = req.body;
        if (!title || !magnet_link || !size || !category)
            return res.status(400).json({
                error: "All fields are required",
                required_fields: ["title", "magnet_link", "size", "category"],
            });

        const document = await createDocument({
            userId: decoded.id,
            title,
            magnetLink: magnet_link,
            size,
            category,
        });

        await logOperation("Document Upload", decoded.id, {
            title,
            size,
            category,
            documentId: document._id,
        });

        res.status(201).json({
            status: "Document uploaded successfully",
            credits: user.credits,
        });
    } catch (error) {
        res.status(403).json({ error: "Invalid token or upload failed" });
        console.error(error);
    }
};

// Download a document
exports.downloadDocument = async (req, res) => {
    const token = req.headers["authorization"];
    if (!token)
        return res.status(401).json({ error: "Token missing or invalid" });

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const [user, document] = await Promise.all([
            User.findUserById(decoded.id),
            Document.findDocumentById(req.body.id),
        ]);

        if (!user) return res.status(404).json({ error: "User not found" });
        if (user.credits < 1) {
            return res.status(403).json({
                error: "Insufficient credits to download",
                credits: user.credits,
            });
        }

        if (!document)
            return res.status(404).json({ error: "Document not found" });

        const uploader = await User.findUserById(document.userId);
        if (!uploader)
            return res.status(404).json({ error: "Uploader not found" });

        if (!user._id.equals(uploader._id)) {
            user.credits -= 1;
            uploader.credits += 1;

            await Promise.all([user.save(), uploader.save()]);
            try {
                await logOperation("Credit Transfer", user._id, {
                    amount: 1,
                    from: user._id,
                    to: uploader._id,
                });
            } catch (logError) {
                console.error("Failed to log credit transfer:", logError);
            }
        }

        // add the docuemt to the user's purchased documents
        user.purchasedDocuments.push({ documentId: document._id });
        await user.save();

        try {
            await logOperation("Document Download", user._id, {
                id: document._id,
                uploaderId: uploader._id,
            });
        } catch (logError) {
            console.error("Failed to log document download:", logError);
        }

        res.status(200).json({
            message: "Download successful",
            credits: user.credits,
            title: document.title,
            size: document.size,
            category: document.category,
            magnet_link: document.magnetLink,
        });
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(403).json({ error: "Invalid token" });
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expired" });
        }
        console.error(error);
        res.status(500).json({ error: "Download failed due to server error" });
    }
};
// Get all documents
exports.getDocuments = async (req, res) => {
    const token = req.headers["authorization"];

    if (!token)
        return res.status(403).json({ error: "Authorization token required" });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const documents = await getAllDocuments();

        const user = await findUserById(decoded.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const purchasedDocumentIds = new Set(
            user.purchasedDocuments.map((doc) => doc.documentId.toString())
        );

        await logOperation(`Documents retrieved by user ${decoded.id}`);

        res.status(200).json({
            torrents: documents.map((doc) => ({
                id: doc._id,
                title: doc.title,
                magnet_link: purchasedDocumentIds.has(doc._id.toString())
                    ? doc.magnetLink
                    : null,
                size: doc.size,
                category: doc.category,
                upload_date: doc.timestamp,
                is_purchased: purchasedDocumentIds.has(doc._id.toString()),
            })),
        });
    } catch (error) {
        res.status(403).json({ error: "Invalid token or retrieval failed" });
        console.error(error);
    }
};
