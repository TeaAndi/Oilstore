const { queryWithUser, sql } = require("../config/sqlserver.dynamic");
const { ok, created, fail } = require("../utils/response");

// GET /api/pedido
async function getAll(req, res) {
  try {
    const q = `
      SELECT
        p.Id_Pedido,
        p.Id_Cliente,
        c.Nombre_Cliente,
        p.Id_Vendedor,
        v.Nombre_Vendedor,
        p.Fecha_Pedido,
        p.Subtotal_Pedido,
        p.IVA,
        p.Total_Pedido
      FROM dbo.Pedido p
      LEFT JOIN dbo.Cliente c ON p.Id_Cliente = c.Id_Cliente
      LEFT JOIN dbo.Vendedor v ON p.Id_Vendedor = v.Id_Vendedor
      ORDER BY p.Fecha_Pedido DESC, p.Id_Pedido DESC
    `;

    const result = await queryWithUser(req.db, q);
    return ok(res, result.recordset ?? [], "Pedidos");
  } catch (e) {
    console.error("❌ getAll pedido error:", e);
    console.error("❌ Error message:", e.message);
    console.error("❌ Error number:", e.number);
    return fail(res, 500, `Error listando pedidos: ${e.message}`);
  }
}

// GET /api/pedido/:id/detalle
async function getDetalle(req, res) {
  try {
    const id = String(req.params.id || "").trim();
    if (!id) return fail(res, 400, "id inválido");

    const q = `
      SELECT
        pp.Id_Pedido,
        pp.Id_Producto,
        pr.Nombre_Producto,
        pp.Cantidad,
        pp.ValorVenta,
        pp.Descuento
      FROM dbo.PedidoProducto pp
      LEFT JOIN dbo.Producto pr ON pp.Id_Producto = pr.Id_Producto
      WHERE pp.Id_Pedido = @id
      ORDER BY pp.Id_Producto
    `;

    const params = [{ name: "id", type: sql.VarChar(10), value: id }];
    const result = await queryWithUser(req.db, q, params);
    return ok(res, result.recordset ?? [], "Detalle del pedido");
  } catch (e) {
    console.error("❌ getDetalle pedido error:", e);
    return fail(res, 500, "Error obteniendo detalle del pedido");
  }
}

// POST /api/pedido
async function create(req, res) {
  try {
    const {
      Id_Cliente,
      Id_Vendedor,
      Subtotal_Pedido,
      IVA,
      Total_Pedido,
      detalles // array de { Id_Producto, Cantidad, ValorVenta, Descuento }
    } = req.body;

    if (!Id_Cliente || !Id_Vendedor) {
      return fail(res, 400, "Cliente y Vendedor son obligatorios");
    }

    // Crear el pedido
    const qPedido = `
      INSERT INTO dbo.Pedido (
        Id_Cliente,
        Id_Vendedor,
        Fecha_Pedido,
        Subtotal_Pedido,
        IVA,
        Total_Pedido
      )
      OUTPUT
        INSERTED.Id_Pedido,
        INSERTED.Id_Cliente,
        INSERTED.Id_Vendedor,
        INSERTED.Fecha_Pedido,
        INSERTED.Subtotal_Pedido,
        INSERTED.IVA,
        INSERTED.Total_Pedido
      VALUES (
        @Id_Cliente,
        @Id_Vendedor,
        GETDATE(),
        @Subtotal_Pedido,
        @IVA,
        @Total_Pedido
      )
    `;

    const paramsPedido = [
      { name: "Id_Cliente", type: sql.VarChar(10), value: String(Id_Cliente).trim() },
      { name: "Id_Vendedor", type: sql.VarChar(10), value: String(Id_Vendedor).trim() },
      { name: "Subtotal_Pedido", type: sql.Decimal(10, 2), value: Subtotal_Pedido || 0 },
      { name: "IVA", type: sql.Decimal(10, 2), value: IVA || 0 },
      { name: "Total_Pedido", type: sql.Decimal(10, 2), value: Total_Pedido || 0 }
    ];

    const resultPedido = await queryWithUser(req.db, qPedido, paramsPedido);
    const pedido = resultPedido.recordset?.[0];

    if (!pedido) {
      return fail(res, 500, "No se pudo crear el pedido");
    }

    // Insertar detalles si existen
    if (Array.isArray(detalles) && detalles.length > 0) {
      for (const detalle of detalles) {
        const qDetalle = `
          INSERT INTO dbo.PedidoProducto (
            Id_Pedido,
            Id_Producto,
            Cantidad,
            ValorVenta,
            Descuento
          )
          VALUES (
            @Id_Pedido,
            @Id_Producto,
            @Cantidad,
            @ValorVenta,
            @Descuento
          )
        `;

        const paramsDetalle = [
          { name: "Id_Pedido", type: sql.VarChar(10), value: pedido.Id_Pedido },
          { name: "Id_Producto", type: sql.VarChar(10), value: String(detalle.Id_Producto).trim() },
          { name: "Cantidad", type: sql.Int, value: detalle.Cantidad || 1 },
          { name: "ValorVenta", type: sql.Decimal(10, 2), value: detalle.ValorVenta || 0 },
          { name: "Descuento", type: sql.Decimal(10, 2), value: detalle.Descuento || 0 }
        ];

        await queryWithUser(req.db, qDetalle, paramsDetalle);
      }
    }

    return created(res, pedido, "Pedido creado");
  } catch (e) {
    console.error("❌ create pedido error:", e);
    if (e.number === 547 || e.message?.includes("FOREIGN KEY")) {
      return fail(res, 400, "Cliente, Vendedor o Producto inválido");
    }
    return fail(res, 500, "Error creando pedido");
  }
}

// PUT /api/pedido/:id
async function update(req, res) {
  try {
    const id = String(req.params.id || "").trim();
    if (!id) return fail(res, 400, "id inválido");

    const {
      Id_Cliente,
      Id_Vendedor,
      Subtotal_Pedido,
      IVA,
      Total_Pedido
    } = req.body;

    const q = `
      UPDATE dbo.Pedido
      SET
        Id_Cliente = @Id_Cliente,
        Id_Vendedor = @Id_Vendedor,
        Subtotal_Pedido = @Subtotal_Pedido,
        IVA = @IVA,
        Total_Pedido = @Total_Pedido
      OUTPUT
        INSERTED.Id_Pedido,
        INSERTED.Id_Cliente,
        INSERTED.Id_Vendedor,
        INSERTED.Fecha_Pedido,
        INSERTED.Subtotal_Pedido,
        INSERTED.IVA,
        INSERTED.Total_Pedido
      WHERE Id_Pedido = @id
    `;

    const params = [
      { name: "id", type: sql.VarChar(10), value: id },
      { name: "Id_Cliente", type: sql.VarChar(10), value: Id_Cliente ? String(Id_Cliente).trim() : null },
      { name: "Id_Vendedor", type: sql.VarChar(10), value: Id_Vendedor ? String(Id_Vendedor).trim() : null },
      { name: "Subtotal_Pedido", type: sql.Decimal(10, 2), value: Subtotal_Pedido || 0 },
      { name: "IVA", type: sql.Decimal(10, 2), value: IVA || 0 },
      { name: "Total_Pedido", type: sql.Decimal(10, 2), value: Total_Pedido || 0 }
    ];

    const result = await queryWithUser(req.db, q, params);
    const row = result.recordset?.[0];
    if (!row) return fail(res, 404, "Pedido no encontrado");

    return ok(res, row, "Pedido actualizado");
  } catch (e) {
    console.error("❌ update pedido error:", e);
    if (e.number === 547 || e.message?.includes("FOREIGN KEY")) {
      return fail(res, 400, "Cliente o Vendedor inválido");
    }
    return fail(res, 500, "Error actualizando pedido");
  }
}

// DELETE /api/pedido/:id
async function remove(req, res) {
  try {
    const id = String(req.params.id || "").trim();
    if (!id) return fail(res, 400, "id inválido");

    // Primero eliminar los detalles (por CASCADE o manualmente)
    const qDetalles = `DELETE FROM dbo.PedidoProducto WHERE Id_Pedido = @id`;
    await queryWithUser(req.db, qDetalles, [{ name: "id", type: sql.VarChar(10), value: id }]);

    // Luego eliminar el pedido
    const q = `
      DELETE FROM dbo.Pedido
      OUTPUT
        DELETED.Id_Pedido,
        DELETED.Id_Cliente,
        DELETED.Id_Vendedor,
        DELETED.Fecha_Pedido,
        DELETED.Subtotal_Pedido,
        DELETED.IVA,
        DELETED.Total_Pedido
      WHERE Id_Pedido = @id
    `;

    const params = [{ name: "id", type: sql.VarChar(10), value: id }];

    const result = await queryWithUser(req.db, q, params);
    const row = result.recordset?.[0];
    if (!row) return fail(res, 404, "Pedido no encontrado");

    return ok(res, row, "Pedido eliminado");
  } catch (e) {
    console.error("❌ remove pedido error:", e);
    return fail(res, 500, "Error eliminando pedido");
  }
}

module.exports = { getAll, getDetalle, create, update, remove };
