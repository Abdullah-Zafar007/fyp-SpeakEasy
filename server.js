require('dotenv').config();
const express = require("express");


const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer");
const Lesson = require('./models/AssignedLesson'); // Adjust path if needed
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const thinfoModel = require("./models/therapistinfo");
const quizformModel = require("./models/quizform");
const LessonTemplate = require("./models/LessonTemplate");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("./models/User"); // if not already imported
const bcrypt = require("bcrypt");



const app = express();
const PORT = process.env.PORT || 4200;

// -------------- MIDDLEWARE -----------------

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));



app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const AssignedLesson = require("./models/AssignedLesson");
const session = require('express-session');

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next(); // User is authenticated, continue
  } else {
    return res.redirect("/login"); // Not authenticated, redirect to login
  }
}

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer storage config for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// -------------- DATABASE -------------------

connectDB(); // Your custom MongoDB connection logic

// ----- Email transporter -----
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "az577330@gmail.com",          // <-- Your email
    pass: "bhor cgis plje exbs",         // <-- App password (correct one, NOT Gmail password)
  },
});


// Mongoose models used in this file:

// Quiz schema/model for quiz questions
const quizSchema = new mongoose.Schema({
  level: String,
  data: Array,
});
const Quiz = mongoose.model("Quiz", quizSchema);

// Response schema/model for quiz answers/responses
const responseSchema = new mongoose.Schema({
  user_answers: Array,
  results: Array,
  timestamp: String,
  user_id: String,
   attemptNumber: Number
});
const Response = mongoose.model("Response", responseSchema);



// -------------- ROUTES ----------------------

// User routes from external router
app.use("/api/users", userRoutes);

// --- Frontend pages rendering ---

app.get("/", (req, res) => res.render("login"));
app.get("/login",  (req, res) => res.render("login"));
app.get("/register", (req, res) => {
  res.render("register");
});


app.get("/forgot-password", (req, res) => {
  res.render("forgot-password");
});

app.get("/appointments",isAuthenticated, (req, res) => res.render("appointments"));
app.get("/appointements",isAuthenticated,  (req, res) => res.render("appointements")); // possible typo but kept as original
app.get('/patient/:userId',isAuthenticated, async (req, res) => {
    const patientId = req.params.userId;
    const patient = await quizformModel.findOne({ userId: patientId });
    res.render('patient', { patient });
});


app.get("/patients",isAuthenticated, (req, res) => res.render("patients"));
app.get("/logout",isAuthenticated,(req, res) => res.render("login"));
app.get("/alphabets",isAuthenticated,(req, res) => res.render("alphabets"));
app.get("/countingprac",isAuthenticated,(req, res) => res.render("countingprac"));
app.get("/haroof",isAuthenticated,(req, res) => res.render("haroof"));
app.get("/jumlay",isAuthenticated,(req, res) => res.render("jumlay"));
app.get("/months",isAuthenticated,(req, res) => res.render("months"));
app.get("/randomprac",isAuthenticated,(req, res) => res.render("randomprac"));
app.get("/waqt_season_practice",isAuthenticated,(req, res) => res.render("waqt_season_practice"));
app.get("/weekcount",isAuthenticated,(req, res) => res.render("weekcount"));
app.get("/practice",isAuthenticated,(req, res) => res.render("practice"));

app.get("/admin/:id",isAuthenticated,  async (req, res) => {
  const adminId = req.params.id;



    res.render("admin", {
      adminId, 
    });
 

});
app.get("/therapist/:id",isAuthenticated, async (req, res) => {
  const therapistId = req.params.id;



    res.render("therapist", {
      therapistId, 
    });
 

});

app.get("/lessons", isAuthenticated, (req, res) => res.render("lessons"));
app.get("/games",isAuthenticated, (req, res) => res.render("games"));
app.get("/phonemes",isAuthenticated, (req, res) => res.render("phonemes"));
app.get("/words", isAuthenticated,(req, res) => res.render("words"));
app.get("/sentences", isAuthenticated, (req, res) => res.render("sentences"));
app.get("/addtherapist",isAuthenticated, (req, res) => res.render("addtherapist"));
app.get("/articulation",isAuthenticated, (req, res) => res.render("articulation"));


// --- Therapist CRUD ---


app.get("/readaddtherapist",isAuthenticated, async (req, res) => {
  const users = await thinfoModel.find();

  res.render("readaddtherapist", {
    users,
    loggedInUser: {
      _id: req.session.userId,
      role: req.session.role
    }
  });
});




// Create therapist
app.post("/create", upload.single("image"), async (req, res) => {
  const { name, email, specialization, experience, rating } = req.body;
  const image = req.file ? req.file.filename : undefined;
  await thinfoModel.create({ name, email, image, specialization, experience, rating });
  res.redirect("/readaddtherapist");
});

// Edit therapist form
app.get("/edit/:userid",isAuthenticated, async (req, res) => {
  const user = await thinfoModel.findOne({ _id: req.params.userid });
  res.render("edittherapist", { user });
});

// Update therapist info
app.post("/update/:userid", upload.single("image"), async (req, res) => {
  const { name, email, specialization, experience, rating } = req.body;
  const image = req.file ? req.file.filename : undefined;
  await thinfoModel.findOneAndUpdate(
    { _id: req.params.userid },
    { name, email, image, specialization, experience, rating },
    { new: true }
  );
  res.redirect("/readaddtherapist");
});

// Delete therapist
app.get("/delete/:userid",isAuthenticated, async (req, res) => {
  await thinfoModel.findOneAndDelete({ _id: req.params.userid });
  res.redirect("/readaddtherapist");
});

// --- Quiz & Patient related routes ---

// Show quiz start form
app.get("/quizform",isAuthenticated, async (req, res) => {
  
  res.render("quizform"); // you can use this in your EJS form
});


app.post("/start-quiz", async (req, res) => {
  const { name, pname, phone, age } = req.body;

  try {
    let user;

    // If session already exists, update existing user
    if (req.session.userId) {
      user = await User.findById(req.session.userId);
      if (user) {
        user.name = name;
        user.pname = pname;
        user.phone = phone;
        user.age = age;
        await user.save();
      }
    }

    // Otherwise, create a new user and set session
    if (!user) {
      user = new User({
        name,
        pname,
        phone,
        age,
        role: "patient"
      });
      await user.save();
      req.session.userId = user._id.toString(); // ✅ Set session
      req.session.role = "patient";
    }

    // Create or update quiz form record
    await quizformModel.findOneAndUpdate(
      { userId: req.session.userId },
      { name, pname, phone, age, userId: req.session.userId },
      { upsert: true, new: true }
    );

    res.redirect("/quiz");
  } catch (error) {
    console.error("Error starting quiz:", error);
    res.status(500).send("Internal Server Error");
  }
});


// In your main Express app or routes/userRoutes.js
app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect("/dashboard"); // fallback
        }
        res.clearCookie("connect.sid"); // optional: clear session cookie
        res.redirect("/login");
    });
});


// Quiz page with user id
app.get("/quiz",isAuthenticated, (req, res) => {
  const user_id = req.query.user_id;
  res.render("quiz", { user_id });
});

// Fetch quiz data by level (easy, medium, hard)
app.get("/quiz/:level",isAuthenticated, async (req, res) => {
  const level = req.params.level;
  if (!["easy", "medium", "hard"].includes(level)) {
    return res.status(400).json({ error: "Invalid level" });
  }
  try {
    const quiz = await Quiz.findOne({ level });
    if (quiz) {
      res.json(quiz.data);
    } else {
      res.status(404).json({ error: "Quiz data not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save quiz response and evaluate answers

app.post('/evaluate', async (req, res) => {
    try {
        const user_id = req.session.userId || req.body.user_id || 'guest';
        const { answers, timestamp = new Date().toISOString() } = req.body;

        if (!answers || !Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ error: 'No answers provided' });
        }

        // ✅ Step 1: Count previous attempts by this user
        const previousAttemptsCount = await Response.countDocuments({ user_id });

        // ✅ Step 2: Determine this attempt number
        const attemptNumber = previousAttemptsCount + 1;

        // ✅ Step 3: Evaluate each answer
        const results = answers.map(answer => {
            const isCorrect = answer.userPronunciation?.trim() === answer.correctPronunciation?.trim();
            return {
                question: answer.question,
                userPronunciation: answer.userPronunciation,
                correctPronunciation: answer.correctPronunciation,
                isCorrect
            };
        });

        const responseData = {
            user_id,
            user_answers: answers,
            results,
            timestamp,
            attemptNumber // ✅ save this
        };

        await Response.create(responseData);
        console.log(`✅ Saved Attempt ${attemptNumber} to DB for user: ${user_id}`);

        res.json({ success: true, results, attemptNumber });

    } catch (err) {
        console.error('❌ Error saving response:', err);
        res.status(500).json({ error: 'Failed to save quiz response.' });
    }
});

// List all patients
app.get("/patientdetail",isAuthenticated, async (req, res) => {
  try {
    const patients = await quizformModel.find();
    res.render("patients", { patients });
  } catch (err) {
    console.error("Error fetching patients:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Show patient detail + quiz reports
app.get("/patient/:user_id",isAuthenticated, async (req, res) => {
  const user_id = req.params.user_id;
  try {
    const patient = await quizformModel.findOne({ userId: user_id });  // <-- use findOne by userId
    if (!patient) return res.status(404).send("Patient not found");

    const reports = await Response.find({ user_id });
    res.render("patientdetail", { patient, reports });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});





// Therapist dashboard: list patients
app.get("/therapist/dashboard",isAuthenticated, async (req, res) => {
  const patients = await quizformModel.find();
  res.render("therapist_dashboard", { patients });
});

// Patient dashboard: show patient info + lessons
app.get("/patient/dashboard/:id",isAuthenticated, async (req, res) => {
  const patientId = req.params.id;

  const patient = await quizformModel.findOne({ userId: patientId });
  const lessons = await AssignedLesson.find({ patientId });

  // Always render the dashboard, even if quizform is not filled yet
  res.render("patient_dashboard", { patient, lessons });
});
app.get("/patient_dashboard/:id",isAuthenticated, async (req, res) => {
  const patientId = req.params.id;
  const patient = await quizformModel.findById(patientId);
 
  const lessons = await AssignedLesson.find({ patientId });
  res.render("patient_dashboard", { patient, lessons });
});


// Assign lesson to patient

app.post('/assign-lesson', upload.array('files', 5), async (req, res) => {
    const { patientId, title, content, lessonType, dueDate ,responseFile} = req.body;
    const files = req.files ? req.files.map(f => f.filename) : [];

    const newLesson = new AssignedLesson({
        patientId,
        title,
        content,
        lessonType,
        assignedDate: new Date(),
        dueDate: dueDate || null,
        files,
        responseFile
    });

    await newLesson.save();

    res.redirect(`/report/${patientId}`);
});


app.post('/upload-response/:lessonId', upload.single('response'), async (req, res) => {
  try {
    const lessonId = req.params.lessonId;
    const file = req.file;

    if (!file) {
      return res.status(400).send('کوئی فائل اپ لوڈ نہیں ہوئی۔');
    }

    // Update the specific lesson with the response file
    await AssignedLesson.findByIdAndUpdate(lessonId, {
      responseFile: file.filename
    });

   // Redirect to the patient's dashboard or report page
  } catch (err) {
    console.error('Error uploading response:', err);
    res.status(500).send('کچھ غلط ہو گیا۔ دوبارہ کوشش کریں۔');
  }
});

app.post('/lesson/:lessonId/feedback', async (req, res) => {
  const lessonId = req.params.lessonId;
  const { feedback } = req.body;

  try {
    await AssignedLesson.findByIdAndUpdate(lessonId, {
      therapistFeedback: feedback
    });

    res.redirect('back');  // or redirect to a report page, dashboard etc.
  } catch (err) {
    console.error('Error saving therapist feedback:', err);
    res.status(500).send('Error saving feedback');
  }
});

// Therapist report (with lessons and quiz results)
app.get("/report/:id", isAuthenticated, async (req, res) => {
  const quizformId = req.params.id; // This is the _id of quizformModel
  const userId = req.params.id;

  try {
    const patient = await quizformModel.findById(quizformId);
    if (!patient) return res.status(404).send("❌ Patient form not found");

    const actualUserId = patient.userId; // 👈 The user ID stored in quizform

    const reports = await Response.find({ user_id: actualUserId }).sort({ timestamp: -1 });
    const lessons = await AssignedLesson.find({ patientId: userId });
    const suggestedLessons = await LessonTemplate.find();

    res.render("report", {
      patient,
      reports,
      lessons,
      suggestedLessons,
      user: {
        _id: req.session.userId,
        role: req.session.role
      }
    });
  } catch (err) {
    console.error("❌ Error fetching therapist report:", err);
    res.status(500).send("Internal Server Error");
  }
});



app.get("/add-template",isAuthenticated, (req, res) => {
  res.render("add-template");
});

app.post("/add-template", async (req, res) => {
  const { category, title, description } = req.body;
  await LessonTemplate.create({ category, title, description });
  res.redirect("/add-template"); 
});

// Patient dashboard alternative route (optional)



app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.render("forgot-password", { error: "Email not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpire = Date.now() + 3600000; // 1 hour

    user.resetToken = token;
    user.resetTokenExpire = tokenExpire;
    console.log("🔐 Saving reset token and expiry:", token, tokenExpire);

    await user.save();

    const resetLink = `http://${req.headers.host}/reset-password/${token}`;

    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset",
      html: `<p>You requested for password reset</p><p>Click this link: <a href="${resetLink}">${resetLink}</a></p>`,
    });

    res.render("forgot-password", { message: "Password reset link sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.render("forgot-password", { error: "Something went wrong" });
  }
});

app.get("/reset-password/:token", async (req, res) => {
  const token = req.params.token;

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.send("Token is invalid or expired.");
  }

  res.render("reset-password", { token });
});

app.post("/reset-password/:token", async (req, res) => {
  const token = req.params.token;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Token is invalid or expired." });
    }

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successful. Please login." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Server error while resetting password." });
  }
});


// -------------- START SERVER -------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
