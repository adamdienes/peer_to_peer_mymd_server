require("dotenv").config();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
    getSystemCredits,
    decrementSystemCredits,
} = require("./systemStateController");
const {
    createUser,
    findUserByUsername,
    findUserbyEmail,
} = require("../models/userModel");
const { logOperation } = require("./blockchainController");
const User = require("../models/userModel");

const SECRET_KEY = process.env.SECRET_KEY;

// Register a new user
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            error: "All fields are required",
            requiredFields: ["username", "email", "password"],
        });
    }

    try {
        const systemCredits = await getSystemCredits();
        console.log(systemCredits);
        if (systemCredits < 20) {
            return res.status(403).json({
                error: "System credits exhausted, registration not allowed",
                remaning_system_credits: systemCredits,
            });
        }

        const userExists = await findUserByUsername(username);
        if (userExists) {
            return res.status(409).json({ error: "Username already exists" });
        }

        const emailExists = await findUserbyEmail(email);
        if (emailExists) {
            return res.status(409).json({ error: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.createUser({
            username,
            email,
            password: hashedPassword,
        });

        await decrementSystemCredits(user._id, 20);
        await logOperation("User Registration", user._id);

        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
            expiresIn: "1h",
        });
        res.status(201).json({ token, credits: user.credits });
    } catch (error) {
        res.status(500).json({ error: "Registration failed" });
        console.error(error);
    }
};

// Login an existing user
exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await findUserByUsername(username);
        if (!user) return res.status(404).json({ error: "User not found" });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid)
            return res.status(401).json({ error: "Invalid password" });

        const token = jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        await logOperation("User Login", user._id, { username });

        res.status(200).json({ token, credits: user.credits });
    } catch (error) {
        res.status(500).json({ error: "Error logging in user" });
        console.error(error);
    }
};
