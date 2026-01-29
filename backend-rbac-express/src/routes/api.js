const router = require("express").Router();

router.use("/auth", require("./auth.routes"));
router.use("/usuarios", require("./usuario.routes"));
router.use("/datos", require("./datos.routes"));
router.use("/producto", require("./producto.routes"));
router.use("/vendedor", require("./vendedor.routes"));
router.use("/cliente", require("./cliente.routes"));
router.use("/pedido", require("./pedido.routes"));


module.exports = router;
