const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
    createDocument,
    findDocumentsByUser,
} = require("../models/documentModel");
const { logToBlockchain } = require("./blockchainController");

const SECRET_KEY = "supersecretkey";

// Upload a document
exports.uploadDocument = async (req, res) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token required" });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const { documentName } = req.body;
        if (!documentName) {
            return res.status(400).json({ error: "Document name is required" });
        }

        const magnetLink = `magnet:?xt=urn:btih:${crypto
            .createHash("sha256")
            .update(documentName)
            .digest("hex")}`;
        await createDocument({ userId: decoded.id, magnetLink });
        logToBlockchain(`Document uploaded by user ${decoded.id}`);
        res.status(201).json({ magnetLink });
    } catch (error) {
        res.status(403).json({ error: "Invalid token or upload failed" });
    }
};

// Get all documents
exports.getDocuments = async (req, res) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token required" });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const documents = await findDocumentsByUser(decoded.id);
        logToBlockchain(`Documents retrieved by user ${decoded.id}`);
        res.status(200).json({
            documents: documents.map((doc) => doc.magnetLink),
        });
    } catch (error) {
        res.status(403).json({ error: "Invalid token or retrieval failed" });
    }
};
