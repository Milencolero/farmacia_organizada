// =============================
// app.js - Configuración principal de Express
// =============================

// Cargar variables de entorno ANTES de importar cualquier otro módulo
import dotenv from "dotenv";
const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
dotenv.config({ path: envFile });

import express from "express";
import cors from "cors";
import morgan from "morgan";

// =============================
// Importar rutas
// =============================
import authRoutes from "./src/routes/auth.js";
import inventarioRoutes from "./src/routes/inventario.js";
import solicitudesRoutes from "./src/routes/solicitudes.js";

const app = express();

// =============================
// Middlewares globales
// =============================
app.use(cors());             // Permitir solicitudes cross-origin
app.use(express.json());     // Parsear JSON en el body
app.use(morgan("dev"));      // Logs HTTP

// =============================
// Ruta de prueba / health check
// =============================
app.get("/", (req, res) => {
  res.json({ message: "API funcionando correctamente" });
});

// =============================
// Rutas principales
// =============================
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/inventario", inventarioRoutes);
app.use("/api/v1/solicitudes", solicitudesRoutes);

// =============================
// Exportar app para server.js o tests
// =============================
export default app;
