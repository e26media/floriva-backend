const jwt = require("jsonwebtoken");
const Admin = require("../Model/Admin");

const generateAdminToken = (admin) =>
  jwt.sign(
    { id: admin._id, role: "admin", username: admin.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

const DEFAULT_ADMIN_USERNAME = "florivaadmin";
const DEFAULT_ADMIN_PASSWORD = "giftsFLORIVA#321";
const LEGACY_ADMIN_USERNAME = "admin";

exports.seedDefaultAdmin = async () => {
  const targetUsername = (
    process.env.ADMIN_USERNAME || DEFAULT_ADMIN_USERNAME
  ).toLowerCase();
  const targetPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

  const legacyAdmin = await Admin.findOne({
    username: LEGACY_ADMIN_USERNAME,
  }).select("+password");

  if (legacyAdmin) {
    legacyAdmin.username = targetUsername;
    legacyAdmin.password = targetPassword;
    await legacyAdmin.save();
    console.log(`Legacy admin migrated (username: ${targetUsername})`);
    return;
  }

  const count = await Admin.countDocuments();
  if (count === 0) {
    await Admin.create({
      username: targetUsername,
      password: targetPassword,
      name: "Admin",
    });
    console.log(`Default admin created (username: ${targetUsername})`);
    return;
  }

  if (process.env.ADMIN_USERNAME || process.env.ADMIN_PASSWORD) {
    const admin =
      (await Admin.findOne({ username: targetUsername }).select("+password")) ||
      (await Admin.findOne().select("+password"));

    if (admin) {
      admin.username = targetUsername;
      admin.password = targetPassword;
      await admin.save();
      console.log(`Admin credentials updated from env (username: ${targetUsername})`);
    }
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const admin = await Admin.findOne({
      username: username.trim().toLowerCase(),
    }).select("+password");

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const token = generateAdminToken(admin);

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({
    success: true,
    admin: {
      id: req.admin._id,
      username: req.admin.username,
      name: req.admin.name,
    },
  });
};
