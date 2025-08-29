import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import * as usuariosController from "../controllers/usuariosController.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(requireAuth);

// Listar todos los usuarios
router.get("/", requireRole("ADMIN"), usuariosController.listarUsuarios);

// Crear usuario
router.post("/", requireRole("ADMIN"), usuariosController.crearUsuario);

// Actualizar usuario por ID
router.put("/:id", requireRole("ADMIN"), usuariosController.actualizarUsuario);

// Eliminar usuario por ID
router.delete("/:id", requireRole("ADMIN"), usuariosController.eliminarUsuario);

export default router;
