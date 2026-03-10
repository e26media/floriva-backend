// Routes/userRoutes.js

const express = require("express");

const {
  verifyOtp,
  googleLogin,
  googleCallback,
  sendOtp,
  allusers,
} = require("../Controllers/userController");

const router = express.Router();

router.post("/send-otp",  sendOtp);
router.post("/verify-otp", verifyOtp);

// ── Google OAuth ──────────────────────────────────────────────
// Step 1: Frontend navigates to this → redirects to Google
router.get("/google-login", googleLogin);

// Step 2: Google redirects back here after account selection
router.get("/google/callback", googleCallback);

router.get('/allusers',allusers);

module.exports = router;