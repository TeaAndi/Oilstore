const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { allowDbRoles } = require("../middlewares/role.middleware");

// aquí luego conectas a SPs reales con execSPWithUser(req.db,...)
router.get("/", authMiddleware, allowDbRoles("db_datareader", "db_datawriter", "db_owner"), (req, res) =>
  res.json({ ok: true, message: "GET datos permitido por SQL role", user: req.user })
);

router.post("/", authMiddleware, allowDbRoles("db_datawriter", "db_owner"), (req, res) =>
  res.json({ ok: true, message: "POST datos permitido por SQL role" })
);

router.delete("/:id", authMiddleware, allowDbRoles("db_owner"), (req, res) =>
  res.json({ ok: true, message: "DELETE datos permitido por db_owner" })
);

module.exports = router;
