// models/LessonTemplate.js
const mongoose = require('mongoose');

const lessonTemplateSchema = new mongoose.Schema({
  category: String,     // e.g., "تلفظ"
  title: String,        // e.g., "س کی آواز کی مشق"
  description: String   // e.g., practice instructions
});

module.exports = mongoose.model('LessonTemplate', lessonTemplateSchema);
