function allowDbRoles(...rolesPermitidos) {
  return (req, res, next) => {
    const dbRole = req.user?.dbRole;
    if (!dbRole) return res.status(401).json({ ok: false, message: "No autenticado" });

    if (!rolesPermitidos.includes(dbRole)) {
      return res.status(403).json({ ok: false, message: "No autorizado por rol SQL" });
    }
    next();
  };
}

module.exports = { allowDbRoles };
