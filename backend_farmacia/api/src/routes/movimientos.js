import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import * as movimientosController from "../controllers/movimientosController.js";

const router = Router();

// Middleware global: todas las rutas requieren autenticación
router.use(requireAuth);

/**
 * @route   GET /api/v1/movimientos
 * @desc    Listar todos los movimientos de inventario
 * @access  Usuario autenticado
 */
router.get("/", movimientosController.listarMovimientos);

export default router;
