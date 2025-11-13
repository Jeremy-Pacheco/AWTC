const jwt = require("jsonwebtoken");
const { User } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET || "SecretAWTCKey";

// Middleware opcional: no fuerza login, solo asigna req.user si hay token
module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    // No hay Authorization -> continuar sin usuario
    if (!authHeader) {
      req.user = null;
      return next();
    }

    // Basic Auth (para login)
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

    // Bearer Token (para rutas autenticadas)
    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      let payload;

      try {
        payload = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        req.user = null; // token inválido -> continuar sin usuario
        return next();
      }

      const user = await User.findByPk(payload.id);
      req.user = user || null;
      req.token = token;
      return next();
    }

    // Tipo de auth no soportado -> continuar sin usuario
    req.user = null;
    return next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    req.user = null;
    return next();
  }
};
