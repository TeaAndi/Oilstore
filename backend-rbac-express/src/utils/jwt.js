const jwt = require("jsonwebtoken");
const { jwt: jwtCfg } = require("../config/config");

function signToken(payload) {
  return jwt.sign(payload, jwtCfg.secret, { expiresIn: jwtCfg.expiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, jwtCfg.secret);
}

module.exports = { signToken, verifyToken };
