const { getPoolForUser, sql } = require("./database");

/**
 * Ejecuta SP con credenciales del usuario (Camino 2).
 * reqDb: { username, password }
 */
async function execSPWithUser(reqDb, spName, params = []) {
  const pool = await getPoolForUser(reqDb.username, reqDb.password);
  const request = pool.request();

  for (const p of params) request.input(p.name, p.type, p.value);

  return request.execute(spName);
}

/**
 * Ejecuta query con credenciales del usuario (Camino 2).
 */
async function queryWithUser(reqDb, query, params = []) {
  const pool = await getPoolForUser(reqDb.username, reqDb.password);
  const request = pool.request();

  for (const p of params) request.input(p.name, p.type, p.value);

  return request.query(query);
}

module.exports = { execSPWithUser, queryWithUser, sql };
