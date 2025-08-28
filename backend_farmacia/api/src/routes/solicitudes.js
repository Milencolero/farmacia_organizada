import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import * as controller from "../controllers/solicitudesController.js";

const router = Router();

// Middleware global: todas las rutas requieren autenticación
router.use(requireAuth);

// =============================
// Rutas de Solicitudes
// =============================

/**
 * @route   POST /api/v1/solicitudes
 * @desc    Crear una nueva solicitud
 * @access  Usuario autenticado
 */
router.post("/", controller.crearSolicitud);

/**
 * @route   GET /api/v1/solicitudes
 * @desc    Listar solicitudes (opcional filtro por usuario o estado vía query)
 * @access  Usuario autenticado
 */
router.get("/", controller.listarSolicitudes);

/**
 * @route   PATCH /api/v1/solicitudes/:id/estado
 * @desc    Cambiar el estado de una solicitud (APROBADA / RECHAZADA)
 * @access  ADMIN
 */
router.patch("/:id/estado", requireRole("ADMIN"), controller.cambiarEstado);

/**
 * @route   POST /api/v1/solicitudes/:id/entregar
 * @desc    Entregar una solicitud aprobada
 * @access  ADMIN
 */
router.post("/:id/entregar", requireRole("ADMIN"), controller.entregarSolicitud);

/**
 * @route   POST /api/v1/solicitudes/:id/aprobar-y-entregar
 * @desc    Aprobar y entregar una solicitud en un solo paso
 * @access  ADMIN
 */
router.post("/:id/aprobar-y-entregar", requireRole("ADMIN"), controller.aprobarYEntregar);

export default router;
