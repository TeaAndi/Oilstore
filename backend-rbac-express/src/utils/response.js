function ok(res, data, message = "OK") {
  return res.json({ ok: true, message, data });
}

function created(res, data, message = "Creado") {
  return res.status(201).json({ ok: true, message, data });
}

function fail(res, status, message = "Error") {
  return res.status(status).json({ ok: false, message });
}

module.exports = { ok, created, fail };
