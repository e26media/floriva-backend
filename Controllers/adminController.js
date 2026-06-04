const jwt = require("jsonwebtoken");
const Admin = require("../Model/Admin");

const generateAdminToken = (admin) =>
  jwt.sign(
    { id: admin._id, role: "admin", username: admin.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

exports.seedDefaultAdmin = async () => {
  const count = await Admin.countDocuments();
  if (count > 0) return;

  const username = (process.env.ADMIN_USERNAME || "admin").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin@123";

  await Admin.create({ username, password, name: "Admin" });
  console.log(`Default admin created (username: ${username})`);
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
