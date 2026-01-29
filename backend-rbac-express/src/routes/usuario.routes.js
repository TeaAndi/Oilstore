const router = require("express").Router();

const { authMiddleware } = require("../middlewares/auth.middleware");
const { allowDbRoles } = require("../middlewares/role.middleware");

const { crearLogin } = require("../controllers/usuario.controller");

// POST /api/usuarios/crear-login
router.post("/crear-login", authMiddleware, allowDbRoles("db_owner"), crearLogin);

module.exports = router;
