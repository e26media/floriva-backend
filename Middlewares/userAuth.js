const jwt = require("jsonwebtoken");
const User = require("../Model/User");

function extractToken(req) {
  const authHeader = req.header("Authorization") || req.header("authorization");
  let token =
    typeof authHeader === "string"
      ? authHeader.replace(/^Bearer\s+/i, "").trim()
      : "";

  if (!token) {
    const xAuth =
      req.header("X-Auth-Token") ||
      req.header("x-auth-token") ||
      req.header("x-access-token");
    if (typeof xAuth === "string" && xAuth.trim()) {
      token = xAuth.replace(/^Bearer\s+/i, "").trim();
    }
  }

  if (!token && req.body) {
    const fromBody = req.body.token || req.body.accessToken || req.body.authToken;
    if (fromBody) {
      token = String(fromBody).replace(/^Bearer\s+/i, "").trim();
    }
  }

  return token || null;
}

const authenticateUser = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.userId || decoded._id;

    if (decoded.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Customer access required",
      });
    }

    const user = userId
      ? await User.findById(userId).select("email phone countrySlug username")
      : decoded.email
        ? await User.findOne({ email: String(decoded.email).toLowerCase() }).select(
            "email phone countrySlug username",
          )
        : null;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = {
      id: user._id,
      email: user.email || decoded.email || null,
      phone: user.phone || decoded.phone || null,
      cartKey: String(user.email || user.phone || user._id).trim().toLowerCase(),
      countrySlug: user.countrySlug || decoded.countrySlug || null,
      username: user.username,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        error.name === "TokenExpiredError"
          ? "Session expired. Please log in again."
          : "Invalid or expired token",
    });
  }
};

const requireMatchingEmail = (req, res, next) => {
  const requested = String(req.params.email || req.params.userEmail || "")
    .trim()
    .toLowerCase();
  const tokenKey = String(req.user?.cartKey || req.user?.email || req.user?.phone || "")
    .trim()
    .toLowerCase();

  if (!requested || !tokenKey || requested !== tokenKey) {
    return res.status(403).json({
      success: false,
      message: "You can only access your own data",
    });
  }

  next();
};

module.exports = { authenticateUser, requireMatchingEmail };
