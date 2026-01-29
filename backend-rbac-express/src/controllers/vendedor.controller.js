const { queryWithUser, sql } = require("../config/sqlserver.dynamic");
const { ok, created, fail } = require("../utils/response");

// GET /api/vendedor
async function getAll(req, res) {
  try {
    const q = `
      SELECT
        Id_Vendedor,
        Nombre_Vendedor,
        Direccion_Vendedor,
        Telefono_Vendedor,
        Correo_Vendedor
      FROM dbo.Vendedor
      ORDER BY Id_Vendedor DESC
    `;

    const result = await queryWithUser(req.db, q);
    return ok(res, result.recordset ?? [], "Vendedores");
  } catch (e) {
    console.error("❌ getAll vendedor error:", e);
    return fail(res, 500, "Error listando vendedores");
  }
}

// POST /api/vendedor
async function create(req, res) {
  try {
    const {
      Nombre_Vendedor,
      Direccion_Vendedor,
      Telefono_Vendedor,
      Correo_Vendedor,
    } = req.body;

    const q = `
      INSERT INTO dbo.Vendedor (
        Nombre_Vendedor,
        Direccion_Vendedor,
        Telefono_Vendedor,
        Correo_Vendedor
      )
      OUTPUT
        INSERTED.Id_Vendedor,
        INSERTED.Nombre_Vendedor,
        INSERTED.Direccion_Vendedor,
        INSERTED.Telefono_Vendedor,
        INSERTED.Correo_Vendedor
      VALUES (
        @Nombre_Vendedor,
        @Direccion_Vendedor,
        @Telefono_Vendedor,
        @Correo_Vendedor
      )
    `;

    const params = [
      { name: "Nombre_Vendedor", type: sql.VarChar(40), value: Nombre_Vendedor ? String(Nombre_Vendedor).trim() : null },
      { name: "Direccion_Vendedor", type: sql.VarChar(50), value: Direccion_Vendedor ? String(Direccion_Vendedor).trim() : null },
      { name: "Telefono_Vendedor", type: sql.VarChar(10), value: Telefono_Vendedor ? String(Telefono_Vendedor).trim() : null },
      { name: "Correo_Vendedor", type: sql.VarChar(50), value: Correo_Vendedor ? String(Correo_Vendedor).trim() : null },
    ];

    const result = await queryWithUser(req.db, q, params);
    const responseData = result.recordset?.[0] ?? null;
    // Log status y respuesta
    console.log("[POST /api/vendedor] status:", 201, "response:", responseData);
    return created(res, responseData, "Vendedor creado");
  } catch (e) {
    console.error("❌ create vendedor error:", e);
    return fail(res, 500, "Error creando vendedor");
  }
}

// PUT /api/vendedor/:id
async function update(req, res) {
  try {
    const id = String(req.params.id || "").trim();
    if (!id) return fail(res, 400, "id inválido");

    const {
      Nombre_Vendedor,
      Direccion_Vendedor,
      Telefono_Vendedor,
      Correo_Vendedor,
    } = req.body;

    const q = `
      UPDATE dbo.Vendedor
      SET
        Nombre_Vendedor = @Nombre_Vendedor,
        Direccion_Vendedor = @Direccion_Vendedor,
        Telefono_Vendedor = @Telefono_Vendedor,
        Correo_Vendedor = @Correo_Vendedor
      OUTPUT
        INSERTED.Id_Vendedor,
        INSERTED.Nombre_Vendedor,
        INSERTED.Direccion_Vendedor,
        INSERTED.Telefono_Vendedor,
        INSERTED.Correo_Vendedor
      WHERE Id_Vendedor = @id
    `;

    const params = [
      { name: "id", type: sql.VarChar(10), value: id },
      { name: "Nombre_Vendedor", type: sql.VarChar(40), value: Nombre_Vendedor ? String(Nombre_Vendedor).trim() : null },
      { name: "Direccion_Vendedor", type: sql.VarChar(50), value: Direccion_Vendedor ? String(Direccion_Vendedor).trim() : null },
      { name: "Telefono_Vendedor", type: sql.VarChar(10), value: Telefono_Vendedor ? String(Telefono_Vendedor).trim() : null },
      { name: "Correo_Vendedor", type: sql.VarChar(50), value: Correo_Vendedor ? String(Correo_Vendedor).trim() : null },
    ];

    const result = await queryWithUser(req.db, q, params);
    const row = result.recordset?.[0];
    if (!row) return fail(res, 404, "Vendedor no encontrado");
    // Log status y respuesta
    console.log("[PUT /api/vendedor/:id] status:", 200, "response:", row);
    return ok(res, row, "Vendedor actualizado");
  } catch (e) {
    console.error("❌ update vendedor error:", e);
    return fail(res, 500, "Error actualizando vendedor");
  }
}

// DELETE /api/vendedor/:id
async function remove(req, res) {
  try {
    const id = String(req.params.id || "").trim();
    if (!id) return fail(res, 400, "id inválido");

    const q = `
      DELETE FROM dbo.Vendedor
      OUTPUT
        DELETED.Id_Vendedor,
        DELETED.Nombre_Vendedor,
        DELETED.Direccion_Vendedor,
        DELETED.Telefono_Vendedor,
        DELETED.Correo_Vendedor
      WHERE Id_Vendedor = @id
    `;

    const params = [{ name: "id", type: sql.VarChar(10), value: id }];

    const result = await queryWithUser(req.db, q, params);
    const row = result.recordset?.[0];
    if (!row) return fail(res, 404, "Vendedor no encontrado");
    // Log status y respuesta
    console.log("[DELETE /api/vendedor/:id] status:", 200, "response:", row);
    return ok(res, row, "Vendedor eliminado");
  } catch (e) {
    console.error("❌ remove vendedor error:", e);
    if (e.number === 547 || e.message?.includes("REFERENCE constraint")) {
      return fail(res, 409, "No se puede eliminar el vendedor porque está asociado a pedidos activos.");
    }
    return fail(res, 500, "Error eliminando vendedor");
  }
}

module.exports = { getAll, create, update, remove };
