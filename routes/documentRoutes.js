const express = require("express");
const {
    uploadDocument,
    getDocuments,
    downloadDocument,
} = require("../controllers/documentController");

const router = express.Router();

router.get("/", getDocuments);
router.post("/upload", uploadDocument);
router.post("/download", downloadDocument);

module.exports = router;
