const express = require('express');

const {
  verifyOtp,
  googleLogin,
  googleCallback,
  sendOtp,
  allusers,
} = require("../Controllers/userController");
const { authenticateAdmin } = require("../Middlewares/adminAuth");

const router = express.Router();

router.post("/send-otp",  sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/google-login", googleLogin);
router.get("/google/callback", googleCallback);
router.get('/allusers', authenticateAdmin, allusers);

module.exports = router;