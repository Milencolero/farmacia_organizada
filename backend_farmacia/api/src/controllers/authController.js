import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

/**
 * Login de usuario
 * Valida credenciales y genera un JWT si son correctas.
 * @param {Request} req 
 * @param {Response} res 
 */
export async function login(req, res) {
  try {
    const { correo, password } = req.body || {};

    // Validación básica de campos
    if (!correo || !password) {
      return res.status(400).json({ error: "Correo y contraseña son obligatorios" });
    }

    // Buscar usuario activo por correo
    const user = await User.findOne({ correo, activo: true });
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    // Comparar contraseña
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    // Generar token JWT
    const token = jwt.sign(
      { id: user._id, rol: user.rol, nombre: user.nombre },
      config.jwtSecret,
      { expiresIn: "1d" }
    );

    // Responder con token y datos básicos del usuario
    res.json({ 
      token, 
      user: { id: user._id, nombre: user.nombre, rol: user.rol, correo: user.correo } 
    });

  } catch (err) {
    console.error("Error login:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * Registro de usuario administrador
 * Crea un usuario con rol ADMIN y contraseña hasheada.
 * @param {Request} req 
 * @param {Response} res 
 */
export async function registerAdmin(req, res) {
  try {
    const { nombre, correo, password, rol } = req.body || {};

    // Validación de campos obligatorios
    if (!nombre || !correo || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Validación básica de formato de correo
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(correo)) {
      return res.status(400).json({ error: "Correo electrónico no válido" });
    }

    // Verificar si el correo ya existe
    const existe = await User.findOne({ correo });
    if (existe) return res.status(409).json({ error: "Correo ya registrado" });

    // Hashear contraseña con salt seguro
    const passwordHash = await bcrypt.hash(password, 11);

  const rolesPermitidos = ["ADMIN", "TENS"];
    if (!rolesPermitidos.includes(rol)) {
      return res.status(400).json({ error: "Rol no permitido" });
    }

    // Crear usuario a
    const u = await User.create({ nombre, correo, passwordHash, rol, activo: true  });

    res.status(201).json({ id: u._id });

  } catch (err) {
    console.error("Error registro usuario:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
