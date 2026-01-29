const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { queryWithUser } = require("../config/sqlserver.dynamic");
const { saveSession } = require("../utils/sessions");

// POST /api/auth/login
async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !String(username).trim()) {
      return res.status(400).json({ ok: false, message: "username es obligatorio" });
    }
    if (!password || !String(password).trim()) {
      return res.status(400).json({ ok: false, message: "password es obligatorio" });
    }

    const u = String(username).trim();
    const p = String(password);

    // 1) Validación real contra SQL Server (si falla -> 401)
    let dbRole = "public";
    try {
      const result = await queryWithUser(
        { username: u, password: p },
        `
        SELECT TOP 1 r.name AS roleName
        FROM sys.database_role_members drm
        JOIN sys.database_principals r ON drm.role_principal_id = r.principal_id
        JOIN sys.database_principals m ON drm.member_principal_id = m.principal_id
        WHERE m.name = USER_NAME()
        ORDER BY
          CASE r.name
            WHEN 'db_owner' THEN 1
            WHEN 'db_datawriter' THEN 2
            WHEN 'db_datareader' THEN 3
            ELSE 99
          END
        `
      );

      dbRole = result.recordset?.[0]?.roleName ?? "public";
    } catch (e) {
      return res.status(401).json({ ok: false, message: "Credenciales inválidas" });
    }

    // 2) Crear sesión en memoria
    const jti = uuidv4();
    saveSession(jti, { username: u, password: p });

    // 3) Crear token
    const token = jwt.sign(
      { username: u, dbRole, jti },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "2h" }
    );

    return res.json({
      ok: true,
      message: "Login exitoso",
      data: {
        token,
        user: { username: u, dbRole },
      },
    });
  } catch (e) {
    console.error("❌ login error:", e);
    return res.status(500).json({ ok: false, message: "Error en login" });
  }
}

module.exports = { login };
