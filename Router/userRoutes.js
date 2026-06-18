const express = require('express');

const {
  verifyOtp,
  googleLogin,
  googleCallback,
  sendOtp,
  allusers,
  syncUserCountry,
} = require("../Controllers/userController");
const { authenticateAdmin } = require("../Middlewares/adminAuth");
const { authenticateUser } = require("../Middlewares/userAuth");
const { authLimiter, otpLimiter } = require("../Middlewares/security");

const router = express.Router();

router.post("/send-otp", otpLimiter, sendOtp);
router.post("/verify-otp", authLimiter, verifyOtp);
router.get("/google-login", googleLogin);
router.get("/google/callback", googleCallback);
router.get('/allusers', authenticateAdmin, allusers);
router.post('/sync-country', authenticateUser, syncUserCountry);

module.exports = router;