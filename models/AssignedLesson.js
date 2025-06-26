const mongoose = require('mongoose');

const assignedLessonSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizForm' },
    title: String,
    content: String,
    lessonType: String,
    assignedDate: { type: Date, default: Date.now },
    dueDate: Date,
    files: [String], 
     responseFile: String ,
     therapistFeedback: String
});

module.exports = mongoose.model('AssignedLesson', assignedLessonSchema);
