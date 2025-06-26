const mongoose = require('mongoose');

const quizformSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true  // only if one form per user
  },
  name: { type: String, required: true },
  pname: { type: String, required: true },
  phone: { type: String, required: true },
  age: { type: Number, required: true },
});

module.exports = mongoose.model("quizform", quizformSchema);
