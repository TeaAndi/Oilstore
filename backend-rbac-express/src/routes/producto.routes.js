const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { allowDbRoles } = require("../middlewares/role.middleware");
const productoController = require("../controllers/producto.controller");

// LISTAR -> reader/writer/owner
router.get("/", authMiddleware, allowDbRoles("db_datareader", "db_datawriter", "db_owner"), productoController.getAll);

// CREAR -> writer/owner
router.post("/", authMiddleware, allowDbRoles("db_datawriter", "db_owner"), productoController.create);

// ACTUALIZAR -> writer/owner
router.put("/:id", authMiddleware, allowDbRoles("db_datawriter", "db_owner"), productoController.update);

// ELIMINAR -> owner
router.delete("/:id", authMiddleware, allowDbRoles("db_datawriter", "db_owner"), productoController.remove);

module.exports = router;
