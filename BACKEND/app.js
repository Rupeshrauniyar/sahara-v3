const express = require("express");
const app = express();
const port = 3000;
const db = require("./db/DB.js");
const cors = require("cors");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
async function connectDB() {
  await db();
  console.log("Connected to MongoDB");
}
connectDB();

// Routes
const aiRoutes = require("./routes/ai.routes");
const authRoutes = require("./routes/auth.routes");
const bloodRequestRoutes = require("./routes/blood.routes");
const hospitalRoutes = require("./routes/hospital.routes.js")
const appointmentRoutes = require("./routes/appointment.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const doctorRoutes = require("./routes/doctor.routes");
const donorRoutes = require("./routes/donor.routes");
// Use Routes
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/blood-requests", bloodRequestRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/blood-donors", donorRoutes);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
