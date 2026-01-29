const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { allowDbRoles } = require("../middlewares/role.middleware");
const vendedorController = require("../controllers/vendedor.controller");

// LISTAR -> reader/writer/owner
router.get("/", authMiddleware, allowDbRoles("db_datareader", "db_datawriter", "db_owner"), vendedorController.getAll);

// CREAR -> writer/owner
router.post("/", authMiddleware, allowDbRoles("db_datawriter", "db_owner"), vendedorController.create);

// ACTUALIZAR -> writer/owner
router.put("/:id", authMiddleware, allowDbRoles("db_datawriter", "db_owner"), vendedorController.update);

// ELIMINAR -> owner
	router.delete("/:id", authMiddleware, allowDbRoles("db_datawriter", "db_owner"), vendedorController.remove);

module.exports = router;
