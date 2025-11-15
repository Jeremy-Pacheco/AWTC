const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "SecretAWTCKey";

function generateToken(user) {
  if (!user) return null;

  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

function getCleanUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

module.exports = {
  generateToken,
  getCleanUser,
};
