const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { allowDbRoles } = require("../middlewares/role.middleware");
const pedidoController = require("../controllers/pedido.controller");

// LISTAR -> reader/writer/owner
router.get("/", authMiddleware, allowDbRoles("db_datareader", "db_datawriter", "db_owner"), pedidoController.getAll);

// DETALLE DE PEDIDO -> reader/writer/owner
router.get("/:id/detalle", authMiddleware, allowDbRoles("db_datareader", "db_datawriter", "db_owner"), pedidoController.getDetalle);

// CREAR -> writer/owner
router.post("/", authMiddleware, allowDbRoles("db_datawriter", "db_owner"), pedidoController.create);

// ACTUALIZAR -> writer/owner
router.put("/:id", authMiddleware, allowDbRoles("db_datawriter", "db_owner"), pedidoController.update);

// ELIMINAR -> owner
router.delete("/:id", authMiddleware, allowDbRoles("db_owner"), pedidoController.remove);

module.exports = router;
