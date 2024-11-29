const crypto = require("crypto");

exports.generateHash = (data) => {
    const hash = crypto.createHash("sha256");
    hash.update(JSON.stringify(data));
    return hash.digest("hex");
};
