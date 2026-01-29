require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000,
  sql: {
    server: process.env.SQLSERVER_HOST,
    port: parseInt(process.env.SQLSERVER_PORT || "1433", 10),
    database: process.env.SQLSERVER_DB,
    user: process.env.SQLSERVER_USER,
    password: process.env.SQLSERVER_PASSWORD,
    options: {
      encrypt: false, // local
      trustServerCertificate: true
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "2h"
  }
};
