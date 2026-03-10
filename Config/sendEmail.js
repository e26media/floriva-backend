const nodemailer = require("nodemailer");

const sendOTP = async (email, otp) => {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,   // ✅ FIXED
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "Your Login OTP",
    html: `<h2>Your OTP: ${otp}</h2>`
  });

};

module.exports = sendOTP;