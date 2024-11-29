require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const validateRoutes = require("./routes/validateRoutes");
const { getSystemCredits } = require("./controllers/systemStateController");
const { connectToDatabase } = require("./models/database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

connectToDatabase();

app.use("/auth", authRoutes);
app.use("/documents", documentRoutes);
app.use("/", validateRoutes);

app.get("/", async (req, res) => {
    const getRoutes = (stack, basePath = "") => {
        const routes = [];
        stack.forEach((middleware) => {
            if (middleware.route) {
                const methods = Object.keys(middleware.route.methods)
                    .join(", ")
                    .toUpperCase();
                routes.push({
                    path: basePath + middleware.route.path,
                    methods,
                });
            } else if (middleware.name === "router") {
                const nestedRoutes = getRoutes(
                    middleware.handle.stack,
                    basePath +
                        (middleware.regexp.source === "^\\/.*$"
                            ? ""
                            : middleware.regexp.source
                                  .replace("\\", "")
                                  .replace("^", "")
                                  .replace("?$", ""))
                );
                routes.push(...nestedRoutes);
            }
        });
        return routes;
    };

    const dbStatus = (() => {
        switch (mongoose.connection.readyState) {
            case 0:
                return "Disconnected";
            case 1:
                return "Connected";
            case 2:
                return "Connecting";
            case 3:
                return "Disconnecting";
            default:
                return "Unknown";
        }
    })();

    const routes = getRoutes(app._router.stack);

    try {
        const systemCredits = await getSystemCredits();

        res.send({
            service: "myMD Server API",
            status: dbStatus === "Connected" ? "Healthy" : "Unhealthy",
            timestamp: new Date().toISOString(),
            database_status: dbStatus,
            remaining_system_credits: systemCredits,
            availableEndpoints: routes,
        });
    } catch (error) {
        res.status(500).send({
            service: "myMD Server API",
            status: "Unhealthy",
            timestamp: new Date().toISOString(),
            database_status: dbStatus,
            error: "Unable to retrieve system credits",
        });

        console.error("Error fetching system credits:", error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});
