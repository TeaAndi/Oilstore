const { queryWithUser, sql } = require("../config/sqlserver.dynamic");
const { ok, created, fail } = require("../utils/response");

// GET /api/cliente
async function getAll(req, res) {
  try {
    const q = `
      SELECT
        Id_Cliente,
        Nombre_Cliente,
        Direccion_Cliente,
        Telefono_Cliente,
        Correo_Cliente
      FROM dbo.Cliente
      ORDER BY Id_Cliente DESC
    `;

    const result = await queryWithUser(req.db, q);
    return ok(res, result.recordset ?? [], "Clientes");
  } catch (e) {
    console.error("❌ getAll cliente error:", e);
    return fail(res, 500, "Error listando clientes");
  }
}

// POST /api/cliente
async function create(req, res) {
  try {
    const {
      Nombre_Cliente,
      Direccion_Cliente,
      Telefono_Cliente,
      Correo_Cliente,
    } = req.body;

    const q = `
      INSERT INTO dbo.Cliente (
        Nombre_Cliente,
        Direccion_Cliente,
        Telefono_Cliente,
        Correo_Cliente
      )
      OUTPUT
        INSERTED.Id_Cliente,
        INSERTED.Nombre_Cliente,
        INSERTED.Direccion_Cliente,
        INSERTED.Telefono_Cliente,
        INSERTED.Correo_Cliente
      VALUES (
        @Nombre_Cliente,
        @Direccion_Cliente,
        @Telefono_Cliente,
        @Correo_Cliente
      )
    `;

    const params = [
      { name: "Nombre_Cliente", type: sql.VarChar(40), value: Nombre_Cliente ? String(Nombre_Cliente).trim() : null },
      { name: "Direccion_Cliente", type: sql.VarChar(50), value: Direccion_Cliente ? String(Direccion_Cliente).trim() : null },
      { name: "Telefono_Cliente", type: sql.VarChar(10), value: Telefono_Cliente ? String(Telefono_Cliente).trim() : null },
      { name: "Correo_Cliente", type: sql.VarChar(50), value: Correo_Cliente ? String(Correo_Cliente).trim() : null },
    ];

    const result = await queryWithUser(req.db, q, params);
    const responseData = result.recordset?.[0] ?? null;
    // Log status y respuesta
    console.log("[POST /api/cliente] status:", 201, "response:", responseData);
    return created(res, responseData, "Cliente creado");
  } catch (e) {
    console.error("❌ create cliente error:", e);
    return fail(res, 500, "Error creando cliente");
  }
}

// PUT /api/cliente/:id
async function update(req, res) {
  try {
    const id = String(req.params.id || "").trim();
    if (!id) return fail(res, 400, "id inválido");

    const {
      Nombre_Cliente,
      Direccion_Cliente,
      Telefono_Cliente,
      Correo_Cliente,
    } = req.body;

    const q = `
      UPDATE dbo.Cliente
      SET
        Nombre_Cliente = @Nombre_Cliente,
        Direccion_Cliente = @Direccion_Cliente,
        Telefono_Cliente = @Telefono_Cliente,
        Correo_Cliente = @Correo_Cliente
      OUTPUT
        INSERTED.Id_Cliente,
        INSERTED.Nombre_Cliente,
        INSERTED.Direccion_Cliente,
        INSERTED.Telefono_Cliente,
        INSERTED.Correo_Cliente
      WHERE Id_Cliente = @id
    `;

    const params = [
      { name: "id", type: sql.VarChar(10), value: id },
      { name: "Nombre_Cliente", type: sql.VarChar(40), value: Nombre_Cliente ? String(Nombre_Cliente).trim() : null },
      { name: "Direccion_Cliente", type: sql.VarChar(50), value: Direccion_Cliente ? String(Direccion_Cliente).trim() : null },
      { name: "Telefono_Cliente", type: sql.VarChar(10), value: Telefono_Cliente ? String(Telefono_Cliente).trim() : null },
      { name: "Correo_Cliente", type: sql.VarChar(50), value: Correo_Cliente ? String(Correo_Cliente).trim() : null },
    ];

    const result = await queryWithUser(req.db, q, params);
    const row = result.recordset?.[0];
    if (!row) return fail(res, 404, "Cliente no encontrado");

    return ok(res, row, "Cliente actualizado");
  } catch (e) {
    console.error("❌ update cliente error:", e);
    return fail(res, 500, "Error actualizando cliente");
  }
}

// DELETE /api/cliente/:id
async function remove(req, res) {
  try {
    const id = String(req.params.id || "").trim();
    if (!id) return fail(res, 400, "id inválido");

    const q = `
      DELETE FROM dbo.Cliente
      OUTPUT
        DELETED.Id_Cliente,
        DELETED.Nombre_Cliente,
        DELETED.Direccion_Cliente,
        DELETED.Telefono_Cliente,
        DELETED.Correo_Cliente
      WHERE Id_Cliente = @id
    `;

    const params = [{ name: "id", type: sql.VarChar(10), value: id }];

    const result = await queryWithUser(req.db, q, params);
    const row = result.recordset?.[0];
    if (!row) return fail(res, 404, "Cliente no encontrado");

    return ok(res, row, "Cliente eliminado");
  } catch (e) {
    console.error("❌ remove cliente error:", e);
    
    // Detectar violación de FK
    if (e.number === 547 || e.message?.includes("REFERENCE constraint")) {
      return fail(res, 409, "No se puede eliminar el cliente porque está asociado a pedidos activos.");
    }
    
    return fail(res, 500, "Error eliminando cliente");
  }
}

module.exports = { getAll, create, update, remove };
