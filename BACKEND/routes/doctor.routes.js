const express = require("express");
const { createDoctor, getDoctors, getDoctorById, getMyDoctorProfile, updateDoctor, updateDoctorAvailability, getHospitalDoctors, deleteDoctor } = require("../controllers/doctor.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/", authMiddleware, createDoctor);
router.get("/", authMiddleware, getDoctors);
router.get("/:id", authMiddleware, getDoctorById);
router.get("/my-profile", authMiddleware, getMyDoctorProfile);
router.put("/:id", authMiddleware, updateDoctor);
router.put("/:id/availability", authMiddleware, updateDoctorAvailability);
router.get("/hospital/:hospitalId", authMiddleware, getHospitalDoctors);
router.delete("/:id", authMiddleware, deleteDoctor);

module.exports = router;
