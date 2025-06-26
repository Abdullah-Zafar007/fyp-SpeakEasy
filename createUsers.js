const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User"); // ✅ Adjust path if needed

// ✅ Replace this with your actual MongoDB URI
const MONGO_URI = "mongodb://localhost:27017/speech_therapy";

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000
}).then(() => {
  console.log("✅ Connected to MongoDB");
  createUsers();
}).catch(err => {
  console.error("❌ MongoDB connection error:", err);
});

const usersToCreate = [
  {
    name: "Dr. Sanaullah",
    username: "drsana",
    email: "dr.sana@example.com",
    phone: "03121234567",
    password: "therapist123",
    role: "therapist",
  },
  {
    name: "Admin Master",
    username: "adminmaster",
    email: "admin@example.com",
    phone: "03001234567",
    password: "admin123",
    role: "admin",
  },
  {
  name: "Dr. Hira Khan",
  username: "drhira",
  email: "hira@example.com",
  phone: "03451234567",
  password: "hira789",
  role: "therapist",
}

];

async function createUsers() {
  for (let user of usersToCreate) {
    try {
      const existing = await User.findOne({ email: user.email });

      if (existing) {
        console.log(`⚠️  Skipped: ${user.email} already exists.`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(user.password, 10);
      const newUser = new User({ ...user, password: hashedPassword });
      await newUser.save();

      console.log(`✅ Created ${user.role}: ${user.username}`);
    } catch (err) {
      console.error(`❌ Error creating ${user.email}:`, err.message);
    }
  }

  mongoose.connection.close();
}
