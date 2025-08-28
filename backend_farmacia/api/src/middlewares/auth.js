import jwt from "jsonwebtoken";
import { config } from "../config.js";

/**
 * Middleware para requerir autenticación por token JWT
 * Coloca el usuario decodificado en req.user
 */
export function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: "Token de autenticación no proporcionado" });
    }

    // Verificar y decodificar token
    req.user = jwt.verify(token, config.jwtSecret);
    next();

  } catch (err) {
    console.error("Error en requireAuth:", err);
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

/**
 * Middleware para restringir acceso según roles
 * @param  {...string} roles - roles permitidos (ej: "ADMIN", "TENS")
 */
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Usuario no autenticado" });

  if (!roles.includes(req.user.rol)) {
    return res.status(403).json({ error: "Acceso denegado: permisos insuficientes" });
  }

  next();
};
