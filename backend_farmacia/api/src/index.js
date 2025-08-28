import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import { config } from "./config.js";
import authRoutes from "./routes/auth.js";
import inventarioRoutes from "./routes/inventario.js";
import { iniciarJobAlertas } from "./jobs/alertasVencimiento.js";
import solicitudesRoutes from "./routes/solicitudes.js";
import movimientosRoutes from "./routes/movimientos.js";

const app = express();

/* ============================= */
/* Middleware global             */
/* ============================= */
app.use(helmet()); // seguridad HTTP headers
app.use(cors());   // permitir CORS
app.use(express.json()); // parse JSON
app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev")); // logging

/* ============================= */
/* Rutas de prueba / API         */
/* ============================= */
app.get("/healthz", (_req, res) => res.json({ status: "ok" }));

/* ============================= */
/* Rutas del sistema             */
/* ============================= */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", inventarioRoutes);
app.use("/api/v1/solicitudes", solicitudesRoutes);
app.use("/api/v1/movimientos", movimientosRoutes);

/* ============================= */
/* Función de arranque del server*/
/* ============================= */
async function bootstrap() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("MongoDB conectado");

    // Iniciar jobs programados (cron)
    iniciarJobAlertas();

    // Levantar servidor
  const PORT = process.env.PORT || config.port || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));

  } catch (err) {
    console.error("Error en arranque del servidor:", err);
    process.exit(1);
  }
}

/* ============================= */
/* Ejecutar bootstrap            */
/* ============================= */
bootstrap();
