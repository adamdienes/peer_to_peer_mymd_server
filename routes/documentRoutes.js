const express = require("express");
const {
    uploadDocument,
    getDocuments,
} = require("../controllers/documentController");

const router = express.Router();

router.post("/upload", uploadDocument);
router.get("/", getDocuments);

module.exports = router;
