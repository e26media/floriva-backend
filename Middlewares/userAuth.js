const jwt = require("jsonwebtoken");
const User = require("../Model/User");

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Customer access required",
      });
    }

    const user = await User.findById(decoded.id).select("email countrySlug username");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = {
      id: user._id,
      email: user.email,
      countrySlug: user.countrySlug || decoded.countrySlug || null,
      username: user.username,
    };
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

const requireMatchingEmail = (req, res, next) => {
  const requested = String(req.params.email || req.params.userEmail || "")
    .trim()
    .toLowerCase();
  const tokenEmail = String(req.user?.email || "").trim().toLowerCase();

  if (!requested || !tokenEmail || requested !== tokenEmail) {
    return res.status(403).json({
      success: false,
      message: "You can only access your own data",
    });
  }

  next();
};

module.exports = { authenticateUser, requireMatchingEmail };
