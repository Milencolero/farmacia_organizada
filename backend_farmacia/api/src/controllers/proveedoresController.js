import * as service from "../services/proveedoresService.js";

/**
 * Crear un nuevo proveedor
 * @param {Request} req 
 * @param {Response} res 
 */
export async function crearProveedor(req, res) {
  try {
    const { nombre, telefono, email, direccion } = req.body || {};

    // Validación de campos obligatorios
    if (!nombre || nombre.trim() === "") {
      return res.status(400).json({ error: "El nombre del proveedor es obligatorio" });
    }

    // Validación básica de email si se proporciona
    if (email && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      return res.status(400).json({ error: "Correo electrónico no válido" });
    }

    // Llamada al servicio para crear proveedor
    const p = await service.crearProveedor({ nombre: nombre.trim(), telefono, email, direccion });
    res.status(201).json(p);

  } catch (err) {
    console.error("Error crearProveedor:", err);
    res.status(400).json({ error: err.message });
  }
}

/**
 * Listar todos los proveedores
 * @param {Request} req 
 * @param {Response} res 
 */
export async function listarProveedores(req, res) {
  try {
    const proveedores = await service.listarProveedores();
    res.json({ items: proveedores });

  } catch (err) {
    console.error("Error listarProveedores:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

import Proveedor from "../models/Proveedor.js";

/**
 * Actualizar un proveedor por ID
 */
export const actualizarProveedor = async (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, email, direccion } = req.body;

  try {
    const proveedor = await Proveedor.findById(id);
    if (!proveedor) return res.status(404).json({ message: "Proveedor no encontrado" });

    proveedor.nombre = nombre?.trim() || proveedor.nombre;
    proveedor.telefono = telefono || proveedor.telefono;
    proveedor.email = email || proveedor.email;
    proveedor.direccion = direccion || proveedor.direccion;

    await proveedor.save();

    res.json(proveedor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar proveedor" });
  }
};

