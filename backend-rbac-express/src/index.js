const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Rutas
app.use(require("./routes/index"));

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API RBAC funcionando 🚀");
});

app.use("/api", require("./routes/api"));
// Puerto
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ API corriendo en http://localhost:${PORT}`);
});
