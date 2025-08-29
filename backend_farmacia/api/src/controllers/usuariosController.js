import User from "../models/User.js";
import bcrypt from "bcrypt";

/**
 * Listar todos los usuarios
 */
export async function listarUsuarios(req, res) {
  try {
    const usuarios = await User.find().sort({ nombre: 1 }).select("-passwordHash");
    res.json({ items: usuarios });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * Crear nuevo usuario
 */
export async function crearUsuario(req, res) {
  try {
    const { nombre, correo, password, rol } = req.body;

    if (!nombre || !correo || !password || !rol) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const existe = await User.findOne({ correo });
    if (existe) return res.status(409).json({ error: "Correo ya registrado" });

    const passwordHash = await bcrypt.hash(password, 11);

    const u = await User.create({ nombre, correo, passwordHash, rol, activo: true });

    res.status(201).json(u);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear usuario" });
  }
}

/**
 * Actualizar usuario
 */
export async function actualizarUsuario(req, res) {
  try {
    const { id } = req.params;
    const { nombre, correo, rol, activo } = req.body;

    const usuario = await User.findById(id);
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    usuario.nombre = nombre || usuario.nombre;
    usuario.correo = correo || usuario.correo;
    usuario.rol = rol || usuario.rol;
    if (activo !== undefined) usuario.activo = activo;

    await usuario.save();

    res.json(usuario);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
}

/**
 * Eliminar usuario
 */
export async function eliminarUsuario(req, res) {
  try {
    const { id } = req.params;

    const usuario = await User.findById(id);
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    await usuario.deleteOne();

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
}
