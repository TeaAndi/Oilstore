// Sesiones en memoria: jti -> { username, password }
const sessions = new Map();

function saveSession(jti, db) {
  sessions.set(jti, db);
}

function getSession(jti) {
  return sessions.get(jti);
}

function deleteSession(jti) {
  sessions.delete(jti);
}

module.exports = { saveSession, getSession, deleteSession };
