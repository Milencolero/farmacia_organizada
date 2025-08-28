import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import * as medicamentosController from "../controllers/medicamentosController.js";
import * as proveedoresController from "../controllers/proveedoresController.js";

const router = Router();

// =============================
// Middleware global para este router
// =============================
router.use(requireAuth); // Todas las rutas requieren autenticación

// =============================
// Rutas de Medicamentos
// =============================

/**
 * @route   POST /api/v1/medicamentos
 * @desc    Crear un nuevo medicamento
 * @access  ADMIN
 */
router.post("/medicamentos", requireRole("ADMIN"), medicamentosController.crearMedicamento);

/**
 * @route   POST /api/v1/medicamentos/:id/ingresos
 * @desc    Agregar un lote a un medicamento existente
 * @access  ADMIN
 */
router.post("/medicamentos/:id/ingresos", requireRole("ADMIN"), medicamentosController.agregarLote);

/**
 * @route   DELETE /api/v1/medicamentos/:id
 * @desc    Eliminar un medicamento
 * @access  ADMIN
 */
router.delete("/medicamentos/:id", requireRole("ADMIN"), medicamentosController.eliminarMedicamento);

/**
 * @route   GET /api/v1/medicamentos
 * @desc    Listar todos los medicamentos
 * @access  Usuario autenticado
 */
router.get("/medicamentos", medicamentosController.listarMedicamentos);

/**
 * @route   GET /api/v1/medicamentos/stock-bajo
 * @desc    Listar medicamentos con stock bajo
 * @access  Usuario autenticado
 */
router.get("/medicamentos/stock-bajo", medicamentosController.medicamentosStockBajo);

/**
 * @route   GET /api/v1/medicamentos/vencer?dias=30
 * @desc    Listar medicamentos próximos a vencer
 * @access  Usuario autenticado
 */
router.get("/medicamentos/vencer", medicamentosController.medicamentosPorVencer);

/**
 * @route   PUT /api/v1/medicamentos/:id
 * @desc    Actualizar un medicamento
 * @access  ADMIN
 */
router.put('/medicamentos/:id', requireRole("ADMIN"), medicamentosController.actualizarMedicamento);

// =============================
// Rutas de Proveedores
// =============================

/**
 * @route   POST /api/v1/proveedores
 * @desc    Crear un proveedor
 * @access  ADMIN
 */
router.post("/proveedores", requireRole("ADMIN"), proveedoresController.crearProveedor);

/**
 * @route   GET /api/v1/proveedores
 * @desc    Listar todos los proveedores
 * @access  Usuario autenticado
 */
router.get("/proveedores", proveedoresController.listarProveedores);

export default router;
