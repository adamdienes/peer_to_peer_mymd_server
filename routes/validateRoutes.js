const express = require("express");
const { validateBlockchain } = require("../utils/verifyBlockchain");

const router = express.Router();

router.get("/validate", validateBlockchain);

module.exports = router;
