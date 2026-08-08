const express = require("express");
const { getDashboardOverview } = require("../controllers/dashboard.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/overview", authMiddleware, getDashboardOverview);

module.exports = router;
