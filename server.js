require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const { connectToDatabase } = require("./models/database");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

connectToDatabase();

app.use("/auth", authRoutes);
app.use("/documents", documentRoutes);

app.get("/", async (req, res) => {
    res.send({
        status: "200",
        service: "API",
        timestamp: new Date().toISOString(),
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});
