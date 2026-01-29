const sql = require("mssql");
const { sql: baseSqlConfig } = require("./config");

function buildUserConfig(username, password) {
  return {
    ...baseSqlConfig,
    user: username,
    password,
  };
}

async function getPoolForUser(username, password) {
  const cfg = buildUserConfig(username, password);

  // NO cachear por usuario, porque eso invalida la verificación de password
  const pool = await new sql.ConnectionPool(cfg).connect();

  // Cerramos el pool cuando el proceso termine (evita conexiones colgadas)
  pool.on("error", () => {});
  return pool;
}

module.exports = { sql, getPoolForUser };
