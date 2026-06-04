const express = require("express");
const { login, getMe } = require("../Controllers/adminController");
const { authenticateAdmin } = require("../Middlewares/adminAuth");

const router = express.Router();

router.post("/admin/login", login);
router.get("/admin/me", authenticateAdmin, getMe);

module.exports = router;
