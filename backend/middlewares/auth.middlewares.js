const jwt = require("jsonwebtoken");
const { User } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET || "SecretAWTCKey";

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    // No Authorization -> continue without user
    if (!authHeader) {
      req.user = null;
      return next();
    }

    // Basic Auth
    if (authHeader.startsWith("Basic ")) {
      const base64Credentials = authHeader.split(" ")[1];
      const credentials = Buffer.from(base64Credentials, "base64").toString("ascii");
      const [email, password] = credentials.split(":");

      if (!email || !password)
        return res.status(400).json({ message: "Basic auth malformed" });

      req.body = req.body || {};
      req.body.email = email;
      req.body.password = password;

      return next();
    }

    // Bearer Token
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      let payload;

      try {
        payload = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        req.user = null;
        return next();
      }

      const user = await User.findByPk(payload.id);
      req.user = user || null;
      req.token = token;
      return next();
    }

    req.user = null;
    return next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    req.user = null;
    return next();
  }
};
