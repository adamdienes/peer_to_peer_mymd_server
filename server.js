require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const { connectToDatabase } = require("./models/database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

connectToDatabase();

app.use("/auth", authRoutes);
app.use("/documents", documentRoutes);

app.listen(PORT, () => {
    console.log(`Server running on localhost:${PORT}`);
});
