const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { allowDbRoles } = require("../middlewares/role.middleware");
const clienteController = require("../controllers/cliente.controller");

// LISTAR -> reader/writer/owner
router.get("/", authMiddleware, allowDbRoles("db_datareader", "db_datawriter", "db_owner"), clienteController.getAll);

// CREAR -> writer/owner
router.post("/", authMiddleware, allowDbRoles("db_datawriter", "db_owner"), clienteController.create);

// ACTUALIZAR -> writer/owner
router.put("/:id", authMiddleware, allowDbRoles("db_datawriter", "db_owner"), clienteController.update);

// ELIMINAR -> owner
router.delete("/:id", authMiddleware, allowDbRoles("db_datawriter", "db_owner"), clienteController.remove);

module.exports = router;
