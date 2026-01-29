const jwt = require("jsonwebtoken");
const { getSession } = require("../utils/sessions");

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const hasBearer = authHeader.toLowerCase().startsWith("bearer ");

    if (!hasBearer) {
      return res.status(401).json({ ok: false, message: "Sesión no encontrada (vuelve a iniciar sesión)" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ ok: false, message: "Sesión no encontrada (vuelve a iniciar sesión)" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Guardamos el usuario en req.user
    req.user = {
      username: payload.username,
      dbRole: payload.dbRole,
      jti: payload.jti,
    };

    // Recuperar credenciales (Camino 2)
    const session = getSession(payload.jti);
    if (!session) {
      return res.status(401).json({ ok: false, message: "Sesión no encontrada (vuelve a iniciar sesión)" });
    }

    // req.db es lo que usa queryWithUser / execSPWithUser
    req.db = session;

    next();
  } catch (e) {
    return res.status(401).json({ ok: false, message: "Sesión no encontrada (vuelve a iniciar sesión)" });
  }
}

module.exports = { authMiddleware };
