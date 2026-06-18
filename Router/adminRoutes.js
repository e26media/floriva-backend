const express = require("express");
const { login, getMe, changePassword } = require("../Controllers/adminController");
const { authenticateAdmin } = require("../Middlewares/adminAuth");
const { authLimiter } = require("../Middlewares/security");

const router = express.Router();

router.post("/admin/login", authLimiter, login);
router.get("/admin/me", authenticateAdmin, getMe);
router.put("/admin/password", authenticateAdmin, changePassword);

module.exports = router;
