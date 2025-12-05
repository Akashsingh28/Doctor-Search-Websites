const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const uri = "mongodb+srv://akashsingh2882005:Akash2005M@cluster0.u9hz4.mongodb.net/DocCare?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri)
  .then(() => console.log("✅ Connected to MongoDB Atlas!"))
  .catch((error) => console.error("❌ Connection failed:", error));

// Doctor Schema
const doctorSchema = new mongoose.Schema({
  name: String,
  location: String,
  speciality: String,
  description: String,
  rating: Number,
  contact: String,
  clinicOrHospitalName: String,
});
const Doctor = mongoose.model("Doctor", doctorSchema);

// Appointment Schema
const appointmentSchema = new mongoose.Schema({
  doctor: String,
  name: String,
  contact: String,
  date: String,
  timeslot: String,
  createdAt: { type: Date, default: Date.now }
});
const Appointment = mongoose.model("Appointment", appointmentSchema);

// Doctor search
app.get("/search", async (req, res) => {
  const query = req.query.q?.trim();
  const filter = req.query.filter?.trim();
  if (!query || !filter) return res.json([]);

  try {
    let searchCondition = {};
    switch(filter) {
      case "City Name":
        searchCondition = { location: { $regex: `^${query}$`, $options: "i" } };
        break;
      case "Specialty":
        searchCondition = { speciality: { $regex: `^${query}$`, $options: "i" } };
        break;
      case "Name":
        searchCondition = { name: { $regex: `^${query}$`, $options: "i" } };
        break;
      case "Symptoms":
        searchCondition = { description: { $regex: `^${query}$`, $options: "i" } };
        break;
      default:
        return res.json([]);
    }
    const doctors = await Doctor.find(searchCondition);
    res.json(doctors);
  } catch (error) {
    console.error("❌ Search Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// Appointment booking
app.post("/appointments", async (req, res) => {
  try {
    const newAppointment = new Appointment(req.body);
    await newAppointment.save();
    res.status(200).json({ message: "Appointment booked successfully" });
  } catch (error) {
    console.error("❌ Appointment Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
