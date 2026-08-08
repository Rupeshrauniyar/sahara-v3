const express = require("express");

const router = express.Router();

const {
  createHospital,
  getHospitals,
  getHospitalById,
  getMyHospital,
  updateHospital,
  updateBeds,
  updateBloodInventory,
  updateEmergencyStatus,
  updateAmbulanceStatus,
  updateHospitalStatus,
  deleteHospital,
} = require("../controllers/hospital.controller");

const authMiddleware =
  require("../middlewares/auth.middleware");

// ============================================================
// GET MY HOSPITAL
// MUST COME BEFORE /:id
// ============================================================

router.get(
  "/my",
  authMiddleware,
  getMyHospital
);

// ============================================================
// GET ALL HOSPITALS
// ============================================================

router.get(
  "/",
  getHospitals
);

// ============================================================
// CREATE HOSPITAL
// ============================================================

router.post(
  "/",
  authMiddleware,
  createHospital
);

// ============================================================
// UPDATE HOSPITAL
// ============================================================

router.put(
  "/:id",
  authMiddleware,
  updateHospital
);

router.put(
  "/:id/beds",
  authMiddleware,
  updateBeds
);

router.put(
  "/:id/blood-inventory",
  authMiddleware,
  updateBloodInventory
);

router.patch(
  "/:id/emergency",
  authMiddleware,
  updateEmergencyStatus
);

router.patch(
  "/:id/ambulance",
  authMiddleware,
  updateAmbulanceStatus
);

router.patch(
  "/:id/status",
  authMiddleware,
  updateHospitalStatus
);

// ============================================================
// DELETE HOSPITAL
// ============================================================

router.delete(
  "/:id",
  authMiddleware,
  deleteHospital
);

// ============================================================
// GET HOSPITAL BY ID
// MUST COME AFTER /my
// ============================================================

router.get(
  "/:id",
  getHospitalById
);

module.exports = router;