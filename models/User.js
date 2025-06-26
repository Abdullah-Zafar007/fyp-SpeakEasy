const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["patient", "therapist","admin"], required: true },
    resetToken: String,
  resetTokenExpire: Date  // ✅ THIS LINE IS REQUIRED
});

module.exports = mongoose.model("User", userSchema);
