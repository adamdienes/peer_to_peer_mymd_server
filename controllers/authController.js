require("dotenv").config();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { createUser, findUserByUsername } = require("../models/userModel");
const { logToBlockchain } = require("./blockchainController");

const SECRET_KEY = process.env.SECRET_KEY;

// Register a new user
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({
            error: "All fields are required: username, email, password",
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await createUser({
            username,
            email,
            password: hashedPassword,
        });
        const token = jwt.sign({ id: user._id, username, email }, SECRET_KEY, {
            expiresIn: "1h",
        });
        await logToBlockchain("User registered", user._id);
        res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({
            error: "Username/e-mail already exists or other error",
        });
    }
};

// Login an existing user
exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res
            .status(400)
            .json({ error: "Username and password are required" });
    }

    try {
        const user = await findUserByUsername(username);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid password" });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        // Log the login action to the blockchain
        await logToBlockchain("User logged in", user._id);

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: "Error logging in user" });
    }
};
