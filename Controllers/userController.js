// Controllers/userController.js

const User = require("../Model/User");
const jwt = require("jsonwebtoken");
const sendOTP = require("../Config/sendEmail");
const { OAuth2Client } = require("google-auth-library");

// ENV variables
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const REDIRECT_URI = process.env.GOOGLE_CALLBACK_URL || "http://localhost:7000/api/google/callback";

// Create Google client
const getClient = () =>
  new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

// =============================
// SEND OTP
// =============================
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email });
    }

    user.otp = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000;

    await user.save();
    await sendOTP(email, otp);

    res.json({
      success: true,
      message: "OTP sent to email",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =============================
// VERIFY OTP
// =============================
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "User not found" });

    if (String(user.otp) !== String(otp))
      return res.status(400).json({ message: "Invalid OTP" });

    if (user.otpExpire < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    user.isVerified = true;
    user.otp = null;
    user.otpExpire = null;

    await user.save();

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =============================
// GOOGLE LOGIN
// =============================
exports.googleLogin = async (req, res) => {
  try {
    const client = getClient();

    const authUrl = client.generateAuthUrl({
      access_type: "offline",
      scope: ["profile", "email"],
      prompt: "select_account",
      redirect_uri: REDIRECT_URI,
    });

    res.redirect(authUrl);
  } catch (err) {
    console.error("Google Login Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// =============================
// GOOGLE CALLBACK
// =============================
exports.googleCallback = async (req, res) => {
  try {
    const client = getClient();
    const { code } = req.query;

    if (!code) {
      return res.redirect(
        `${FRONTEND_URL}/google/callback?error=No+authorization+code`
      );
    }

    // Exchange code for tokens
    const { tokens } = await client.getToken({
      code,
      redirect_uri: REDIRECT_URI,
    });

    client.setCredentials(tokens);

    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, sub } = ticket.getPayload();

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        username: name,
        email,
        googleId: sub,
        isVerified: true,
      });
    } else {
      if (!user.googleId) user.googleId = sub;
      if (!user.username) user.username = name;

      user.isVerified = true;
      await user.save();
    }

    const token = generateToken(user);

    const params = new URLSearchParams({
      success: "true",
      token,
      name: user.username || "",
      email: user.email,
    });

    res.redirect(
      `${FRONTEND_URL}/google/callback?${params.toString()}`
    );
  } catch (err) {
    console.error("Google Callback Error:", err.message);

    res.redirect(
      `${FRONTEND_URL}/google/callback?error=${encodeURIComponent(
        err.message
      )}`
    );
  }
};

// =============================
// GET ALL USERS
// =============================
exports.allusers = async (req, res) => {
  try {
    const users = await User.find();

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};