const validateRegister = (body) => {
  const errors = [];
  if (!body.username) errors.push("username is required");
  if (!body.phone) errors.push("phone is required");
  if (!body.email) errors.push("email is required");
  if (!body.password) errors.push("password is required");
  if (!body.role) errors.push("role is required");
  return errors;
};

const validateLogin = (body) => {
  const errors = [];
  // allow login via email OR phone
  if (!body.email && !body.phone) errors.push("email or phone is required");
  if (!body.password) errors.push("password is required");
  return errors;
};

module.exports={validateRegister,validateLogin}
