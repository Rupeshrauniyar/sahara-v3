const express = require("express");

const router = express.Router();

const {
  createBloodRequest,
  getMyBloodRequests,
  getActiveBloodRequests,
  getHospitalBloodRequests,
  getAllBloodRequestsForHospital,
  getBloodRequestById,
  cancelBloodRequest,
} = require("../controllers/blood.controller");

const authMiddleware = require("../middlewares/auth.middleware");

// =====================================================
// CREATE BLOOD REQUEST
// =====================================================

router.post(
  "/",
  authMiddleware,
  createBloodRequest
);

// =====================================================
// SPECIAL ROUTES
// THESE MUST COME BEFORE /:id
// =====================================================

// Patient's own requests
router.get(
  "/my",
  authMiddleware,
  getMyBloodRequests
);

// All active requests
router.get(
  "/active",
  authMiddleware,
  getActiveBloodRequests
);

// Hospital's own requests
router.get(
  "/hospital",
  authMiddleware,
  getHospitalBloodRequests
);

// All requests for HospitalAdmin
router.get(
  "/hospital/all",
  authMiddleware,
  getAllBloodRequestsForHospital
);

// =====================================================
// SINGLE REQUEST
// THIS MUST BE LAST
// =====================================================

router.get(
  "/:id",
  authMiddleware,
  getBloodRequestById
);

// =====================================================
// CANCEL REQUEST
// =====================================================

router.patch(
  "/:id/cancel",
  authMiddleware,
  cancelBloodRequest
);

module.exports = router;