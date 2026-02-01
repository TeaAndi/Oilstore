const { queryWithUser, sql } = require("../config/sqlserver.dynamic");
const { ok, created, fail } = require("../utils/response");

// GET /api/producto
async function getAll(req, res) {
  try {
    const q = `
      SELECT
        Id_Producto,
        Nombre_Producto,
        Descripcion_Producto,
        Stock_Producto,
        Valor_Producto,
        Unidad_Medida
      FROM dbo.Producto
      ORDER BY Id_Producto DESC
    `;

    const result = await queryWithUser(req.db, q);
    return ok(res, result.recordset ?? [], "Productos");
  } catch (e) {
    console.error("❌ getAll producto error:", e);
    return fail(res, 500, "Error listando productos");
  }
}

// POST /api/producto
async function create(req, res) {
  try {
    const {
      Nombre_Producto,
      Descripcion_Producto,
      Stock_Producto,
      Valor_Producto,
      Unidad_Medida,
    } = req.body;

    const q = `
      INSERT INTO dbo.Producto (
        Nombre_Producto,
        Descripcion_Producto,
        Stock_Producto,
        Valor_Producto,
        Unidad_Medida
      )
      OUTPUT
        INSERTED.Id_Producto,
        INSERTED.Nombre_Producto,
        INSERTED.Descripcion_Producto,
        INSERTED.Stock_Producto,
        INSERTED.Valor_Producto,
        INSERTED.Unidad_Medida
      VALUES (
        @Nombre_Producto,
        @Descripcion_Producto,
        @Stock_Producto,
        @Valor_Producto,
        @Unidad_Medida
      )
    `;

    const params = [
      { name: "Nombre_Producto", type: sql.NVarChar(40), value: Nombre_Producto ? String(Nombre_Producto).trim() : null },
      { name: "Descripcion_Producto", type: sql.NVarChar(100), value: Descripcion_Producto ? String(Descripcion_Producto).trim() : null },
      { name: "Stock_Producto", type: sql.Int, value: Number.isFinite(Number(Stock_Producto)) ? Number(Stock_Producto) : null },
      { name: "Valor_Producto", type: sql.Decimal(10, 2), value: Number.isFinite(Number(Valor_Producto)) ? Number(Valor_Producto) : null },
      { name: "Unidad_Medida", type: sql.NVarChar(20), value: Unidad_Medida ? String(Unidad_Medida).trim() : null },
    ];

    const result = await queryWithUser(req.db, q, params);
    const responseData = result.recordset?.[0] ?? null;
    // Log status y respuesta
    console.log("[POST /api/producto] status:", 201, "response:", responseData);
    return created(res, responseData, "Producto creado");
  } catch (e) {
    console.error("❌ create producto error:", e);
    return fail(res, 500, "Error creando producto");
  }
}

// PUT /api/producto/:id
async function update(req, res) {
  try {
    const id = String(req.params.id || "").trim();
    if (!id) return fail(res, 400, "id inválido");

    const {
      Nombre_Producto,
      Descripcion_Producto,
      Stock_Producto,
      Valor_Producto,
      Unidad_Medida,
    } = req.body;

    const q = `
      UPDATE dbo.Producto
      SET
        Nombre_Producto = @Nombre_Producto,
        Descripcion_Producto = @Descripcion_Producto,
        Stock_Producto = @Stock_Producto,
        Valor_Producto = @Valor_Producto,
        Unidad_Medida = @Unidad_Medida
      OUTPUT
        INSERTED.Id_Producto,
        INSERTED.Nombre_Producto,
        INSERTED.Descripcion_Producto,
        INSERTED.Stock_Producto,
        INSERTED.Valor_Producto,
        INSERTED.Unidad_Medida
      WHERE Id_Producto = @id
    `;

    const params = [
      { name: "id", type: sql.NVarChar(10), value: id },
      { name: "Nombre_Producto", type: sql.NVarChar(40), value: Nombre_Producto ? String(Nombre_Producto).trim() : null },
      { name: "Descripcion_Producto", type: sql.NVarChar(100), value: Descripcion_Producto ? String(Descripcion_Producto).trim() : null },
      { name: "Stock_Producto", type: sql.Int, value: Number.isFinite(Number(Stock_Producto)) ? Number(Stock_Producto) : null },
      { name: "Valor_Producto", type: sql.Decimal(10, 2), value: Number.isFinite(Number(Valor_Producto)) ? Number(Valor_Producto) : null },
      { name: "Unidad_Medida", type: sql.NVarChar(20), value: Unidad_Medida ? String(Unidad_Medida).trim() : null },
    ];

    const result = await queryWithUser(req.db, q, params);
    const row = result.recordset?.[0];
    if (!row) return fail(res, 404, "Producto no encontrado");
    // Log status y respuesta
    console.log("[PUT /api/producto/:id] status:", 200, "response:", row);
    return ok(res, row, "Producto actualizado");
  } catch (e) {
    console.error("❌ update producto error:", e);
    return fail(res, 500, "Error actualizando producto");
  }
}

// DELETE /api/producto/:id
async function remove(req, res) {
  try {
    const id = String(req.params.id || "").trim();
    if (!id) return fail(res, 400, "id inválido");

    const q = `
      DELETE FROM dbo.Producto
      OUTPUT
        DELETED.Id_Producto,
        DELETED.Nombre_Producto,
        DELETED.Descripcion_Producto,
        DELETED.Stock_Producto,
        DELETED.Valor_Producto,
        DELETED.Unidad_Medida
      WHERE Id_Producto = @id
    `;

    const params = [{ name: "id", type: sql.NVarChar(10), value: id }];

    const result = await queryWithUser(req.db, q, params);
    const row = result.recordset?.[0];
    if (!row) return fail(res, 404, "Producto no encontrado");
    // Log status y respuesta
    console.log("[DELETE /api/producto/:id] status:", 200, "response:", row);
    return ok(res, row, "Producto eliminado");
  } catch (e) {
    console.error("❌ delete producto error:", e);
    // Si es error de FK constraint, devolver mensaje más claro
    if (e.message && e.message.includes("FK")) {
      return fail(res, 409, "No se puede eliminar: el producto está asociado a pedidos");
    }
    return fail(res, 500, `Error eliminando producto: ${e.message}`);
  }
}

module.exports = { getAll, create, update, remove };
