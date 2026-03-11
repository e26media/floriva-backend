// Controllers/userController.js

const User = require("../Model/User");
const jwt = require("jsonwebtoken");
const sendOTP = require("../Config/sendEmail");
const { OAuth2Client } = require("google-auth-library");

// ✅ Automatically switches between local and production
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const REDIRECT_URI = IS_PRODUCTION
  ? "https://api.florivagifts.com/api/google/callback"
  : "http://localhost:7000/api/google/callback";

const FRONTEND_URL = IS_PRODUCTION
  ? "https://www.florivagifts.com"
  : "http://localhost:3000";

const getClient = () =>
  new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
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
    if (!user) user = new User({ email });

    user.otp = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000;
    await user.save();
    await sendOTP(email, otp);

    res.json({ success: true, message: "OTP sent to email" });
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

    if (!user) return res.status(400).json({ message: "User not found" });
    if (String(user.otp) !== String(otp))
      return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpire < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    user.isVerified = true;
    user.otp = null;
    user.otpExpire = null;
    await user.save();

    const token = generateToken(user);
    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =============================
// GOOGLE LOGIN — Step 1
// =============================
exports.googleLogin = async (req, res) => {
  try {
    const client = getClient();

    const authUrl = client.generateAuthUrl({
      access_type: "offline",
      scope: ["profile", "email"],
      prompt: "select_account",
    });

    res.redirect(authUrl);
  } catch (err) {
    console.error("googleLogin error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// =============================
// GOOGLE CALLBACK — Step 2
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

    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, sub } = ticket.getPayload();

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
      name: user.username || name || "",
      email: user.email,
    });

    res.redirect(`${FRONTEND_URL}/google/callback?${params.toString()}`);
  } catch (err) {
    console.error("Google callback error:", err.message);
    res.redirect(
      `${FRONTEND_URL}/google/callback?error=${encodeURIComponent(err.message)}`
    );
  }
};

exports.allusers = async (req, res) => {
  try {
    const users = await User.find();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};