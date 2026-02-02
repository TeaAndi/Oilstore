const express = require("express");
const cors = require("cors");
require("dotenv").config();


const app = express();

// Configuración CORS para permitir solicitudes desde Ionic (localhost:8100) y cualquier otro origen
app.use(cors({
  origin: '*', // Puedes cambiar '*' por ['http://localhost:8100'] para mayor seguridad
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'bypass-tunnel-reminder', 'ngrok-skip-browser-warning']
}));
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
