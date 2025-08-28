import { Router } from "express";
import { login, registerAdmin } from "../controllers/authController.js";

const router = Router();

/**
 * @route   POST /api/v1/auth/login
 * @desc    Inicia sesión de un usuario
 * @access  Público
 */
router.post("/login", login);

/**
 * @route   POST /api/v1/auth/register-admin
 * @desc    Registra un usuario con rol ADMIN
 * @access  Público (o restringir en producción)
 */
router.post("/register-admin", registerAdmin);

export default router;
