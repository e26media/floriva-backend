// Controllers/userController.js

const User = require("../Model/User");
const jwt = require("jsonwebtoken");
const emailService = require("../Config/sendEmail");
const { OAuth2Client } = require("google-auth-library");

const REDIRECT_URI = process.env.GOOGLE_CALLBACK_URL || "https://api.florivagifts.com/api/google/callback"
const FRONTEND_URL = (process.env.FRONTEND_URL || "https://florivagifts.com").replace(/\/$/, "")
const sendOTP = emailService.sendOTP || emailService.default || emailService;
const sendWelcomeEmail = emailService.sendWelcomeEmail || (async () => {});
const { detectStoreCountryFromRequest, normalizeStoreCountrySlug } = require("../Utils/geoCountry");

// ✅ getClient() is called at REQUEST time, not at module load time
// This ensures process.env variables are already loaded by dotenv
const getClient = () => new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, countrySlug: user.countrySlug || null },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

async function assignUserCountry(user, req) {
  const fromBody = normalizeStoreCountrySlug(req.body?.countrySlug);
  const detected = detectStoreCountryFromRequest(req).countrySlug;
  user.countrySlug = fromBody || detected || user.countrySlug || "india";
  await user.save();
  return user.countrySlug;
}

// =============================
// SEND OTP
// =============================
exports.sendOtp = async (req, res) => {
  try {
    const { email, name, username, purpose = "login" } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: "Valid email is required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    let user = await User.findOne({ email: normalizedEmail });
    if (!user) user = new User({ email: normalizedEmail });

    user.otp = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000;
    user.pendingAuthPurpose = purpose === "signup" ? "signup" : "login";
    const displayName = String(name || username || "").trim();
    if (displayName) user.username = displayName;
    await user.save();
    await sendOTP(normalizedEmail, otp);

    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// =============================
// VERIFY OTP
// =============================
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) return res.status(400).json({ message: "User not found" });
    if (String(user.otp) !== String(otp))
      return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpire < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    user.isVerified = true;
    user.otp = null;
    user.otpExpire = null;

    const isSignup = purpose === "signup" || user.pendingAuthPurpose === "signup";
    user.pendingAuthPurpose = "login";

    if (isSignup && !user.welcomeEmailSent) {
      try {
        await sendWelcomeEmail(user.email, user.username || "");
        user.welcomeEmailSent = true;
      } catch (emailErr) {
        console.error("[User] Welcome email failed (non-fatal):", emailErr.message);
      }
    }

    await assignUserCountry(user, req);

    const token = generateToken(user);
    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =============================
// GOOGLE LOGIN — Step 1
// User clicks "Login with Google" → comes here → redirected to Google
// =============================
exports.googleLogin = async (req, res) => {
  try {
    const client = getClient(); // ✅ fresh client, env vars loaded by now

    console.log("🔑 CLIENT_ID at request time:", process.env.GOOGLE_CLIENT_ID);

    const authUrl = client.generateAuthUrl({
      access_type: "offline",
      scope: ["profile", "email"],
      prompt: "select_account",
      redirect_uri: REDIRECT_URI,
    });

    res.redirect(authUrl);
  } catch (err) {
    console.error("googleLogin error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// =============================
// GOOGLE CALLBACK — Step 2
// Google redirects here after user picks account
// =============================
exports.googleCallback = async (req, res) => {
  try {
    const client = getClient(); // ✅ fresh client
    const { code } = req.query;

    if (!code) {
      return res.redirect(
        `${FRONTEND_URL}/google/callback?error=No+authorization+code`
      );
    }

    // Exchange code → tokens
    const { tokens } = await client.getToken({
      code,
      redirect_uri: REDIRECT_URI,
    });

    client.setCredentials(tokens);

    // Get user info from ID token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, sub } = ticket.getPayload();

    // Find or create user in MongoDB
    let user = await User.findOne({ email });
    let createdUser = false;
    if (!user) {
      user = await User.create({
        username: name,
        email,
        googleId: sub,
        isVerified: true,
      });
      createdUser = true;
    } else {
      if (!user.googleId) user.googleId = sub;
      if (!user.username) user.username = name;
      user.isVerified = true;
      await user.save();
    }

    if (createdUser && !user.welcomeEmailSent) {
      try {
        await sendWelcomeEmail(user.email, user.username || name || "");
        user.welcomeEmailSent = true;
        await user.save();
      } catch (emailErr) {
        console.error("[User] Welcome email failed (non-fatal):", emailErr.message);
      }
    }

    await assignUserCountry(user, req);

    const token = generateToken(user);

    // Redirect to Next.js frontend callback page
    const params = new URLSearchParams({
      success: "true",
      token,
      name: user.username || name || "",
      email: user.email,
      countrySlug: user.countrySlug || "",
    });

    res.redirect(
      `${FRONTEND_URL}/google/callback?${params.toString()}`
    );
  } catch (err) {
    console.error("Google callback error:", err.message);
    res.redirect(
      `${FRONTEND_URL}/google/callback?error=${encodeURIComponent(
        err.message
      )}`
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

exports.syncUserCountry = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await assignUserCountry(user, req);

    const Country = require("../Model/country");
    const storeCountry = await Country.findOne({
      name: new RegExp(`^${user.countrySlug}$`, "i"),
    }).lean();

    res.json({
      success: true,
      countrySlug: user.countrySlug,
      country: storeCountry || null,
      user: {
        email: user.email,
        username: user.username,
        countrySlug: user.countrySlug,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
