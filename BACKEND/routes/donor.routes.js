const express = require("express");

const router = express.Router();

const {
  becomeDonor,
  getActiveDonors,
  getMyDonorProfile,
  updateDonorAvailability,
  updateEmergencyAvailability,
  updateDonorInformation,
  leaveDonorProgram,
} = require("../controllers/donor.controller");

const authMiddleware = require("../middlewares/auth.middleware");

router.get(
  "/active",
  authMiddleware,
  getActiveDonors
);

router.get(
  "/me",
  authMiddleware,
  getMyDonorProfile
);

router.post(
  "/become",
  authMiddleware,
  becomeDonor
);

router.patch(
  "/availability",
  authMiddleware,
  updateDonorAvailability
);

router.patch(
  "/emergency-availability",
  authMiddleware,
  updateEmergencyAvailability
);

router.patch(
  "/information",
  authMiddleware,
  updateDonorInformation
);

router.delete(
  "/leave",
  authMiddleware,
  leaveDonorProgram
);

module.exports = router;