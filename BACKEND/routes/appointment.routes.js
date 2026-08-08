const express = require("express");

const {
  getAvailableDoctors,
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
} = require("../controllers/appointment.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// List doctors available for booking
router.get("/doctors", authMiddleware, getAvailableDoctors);

// Book appointment (patient)
router.post("/", authMiddleware, createAppointment);

// Patient appointments
router.get("/my", authMiddleware, getMyAppointments);

// Doctor appointments
router.get("/doctor", authMiddleware, getDoctorAppointments);

// Single appointment
router.get("/:id", authMiddleware, getAppointmentById);

// Doctor updates status (confirm / reject / complete)
router.patch("/:id/status", authMiddleware, updateAppointmentStatus);

// Cancel appointment
router.patch("/:id/cancel", authMiddleware, cancelAppointment);

module.exports = router;
