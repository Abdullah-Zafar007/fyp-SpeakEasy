const bcrypt = require("bcrypt");
const User = require("../models/User");

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, username, email, phone, password, role } = req.body;

    if (!name || !username || !email || !phone || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Password length validation
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }

    // Check for existing email or username
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? "Email already registered" : "Username already taken",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      username,
      email,
      phone,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    res.status(201).json({ success: true, message: "User registered successfully" });

  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Search by either email or username
    const user = await User.findOne({
      $or: [{ email: email }, { username: email }],
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    if (user.role !== role) {
      return res.status(400).json({
        success: false,
        message: `Role mismatch: Registered as ${user.role}`,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Invalid password" });
    }

    req.session.userId = user._id;
    req.session.role = user.role;

    res.status(200).json({
      success: true,
      message: "Login successful",
      role: user.role,
      userId: user._id,
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { registerUser, loginUser };
