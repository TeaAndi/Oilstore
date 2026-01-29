// Sesiones en memoria: jti -> { username, password }
const sessions = new Map();

function setSession(jti, data) {
  sessions.set(jti, data);
}

function getSession(jti) {
  return sessions.get(jti);
}

function deleteSession(jti) {
  sessions.delete(jti);
}

module.exports = { setSession, getSession, deleteSession };
