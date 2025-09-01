
const User = require("../models/User");
const jwt = require("jsonwebtoken");

//generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });
};

//register user
exports.registerUser = async (req, res) => {
    const { fullName, email, password, profileImageUrl } = req.body;
    //check for missing fields
    if (!fullName || !email || !password) {
        return res.status(400).json({ message: "Please fill all fields" });
    }
    try {
        //check if mail already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        //create user
        const user = await User.create({
            fullName,
            email,
            password,
            profileImageUrl,
        });
        res.status(201).json({
            id: user._id,
            user,
            token: generateToken(user._id),
        });
    } catch (error) {
        res
            .status(500)
            .json({ message: "Error while registering user", error: error.message });
    }
};

//login user
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Please fill all fields" });
    }
    try {
        const user = await User.findOne({ email });
        if (!user && !(await user.matchPassword(password))) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        res.status(200).json({
            id: user._id,
            user,
            token: generateToken(user._id),
        });
    } catch (error) {
        res
            .status(500)
            .json({ message: "Error while logging in user", error: error.message });
    }
};

//register user
exports.getUserInfo = async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res
            .status(500)
            .json({ message: "Error while registering user", error: error.message });
    }
};