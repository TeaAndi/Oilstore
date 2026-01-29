const { queryWithUser, sql } = require("../config/sqlserver.dynamic");

// POST /api/usuarios/crear-login
async function crearLogin(req, res) {
  try {
    // Solo SA puede crear logins
    if ((req.user?.username ?? "").toLowerCase() !== "sa") {
      return res.status(403).json({ ok: false, message: "Solo el usuario 'sa' puede crear logins" });
    }

    const { username, password, dbRole } = req.body;

    if (!username || !String(username).trim()) {
      return res.status(400).json({ ok: false, message: "username es obligatorio" });
    }
    if (!password || !String(password).trim()) {
      return res.status(400).json({ ok: false, message: "password es obligatorio" });
    }

    const login = String(username).trim();
    const dbName = process.env.SQLSERVER_DB;

    const allowedRoles = ["db_datareader", "db_datawriter", "db_owner"];
    const role = allowedRoles.includes(dbRole) ? dbRole : "db_datareader";

    // req.db debe venir del middleware (credenciales del usuario logueado)
    const reqDb = req.db;

    // 1) Crear LOGIN (server)
    await queryWithUser(
      reqDb,
      `EXEC sp_addlogin @loginame=@u, @passwd=@p, @defdb=@db`,
      [
        { name: "u", type: sql.NVarChar(128), value: login },
        { name: "p", type: sql.NVarChar(128), value: String(password) },
        { name: "db", type: sql.NVarChar(128), value: dbName },
      ]
    );

    // 2) Crear USER (db)
    await queryWithUser(
      reqDb,
      `USE ${dbName}; EXEC sp_adduser @loginame=@u, @name_in_db=@u`,
      [{ name: "u", type: sql.NVarChar(128), value: login }]
    );

    // 3) Asignar rol
    await queryWithUser(
      reqDb,
      `USE ${dbName}; EXEC sp_addrolemember @rolename=@r, @membername=@u`,
      [
        { name: "r", type: sql.NVarChar(128), value: role },
        { name: "u", type: sql.NVarChar(128), value: login },
      ]
    );

    const responseData = { username: login, dbRole: role };
    // Log status y respuesta
    console.log("[POST /api/usuarios/crear-login] status:", 201, "response:", responseData);
    return res.status(201).json({
      ok: true,
      message: "Login/User creado y rol asignado",
      data: responseData,
    });
  } catch (e) {
    console.error("❌ crearLogin error:", e);
    return res.status(500).json({ ok: false, message: e?.message ?? "Error creando login" });
  }
}

module.exports = { crearLogin };
