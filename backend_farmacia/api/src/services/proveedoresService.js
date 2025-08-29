import Proveedor from "../models/Proveedor.js";

/**
 * Crear un nuevo proveedor
 * @param {Object} data - { nombre, telefono, email, direccion }
 * @returns {Promise<Proveedor>}
 * @throws {Error} Si el nombre es vacío o ya existe
 */
export async function crearProveedor(data) {
  const { nombre, telefono, email, direccion } = data || {};

  // Validación básica
  if (!nombre || nombre.trim() === "") {
    throw new Error("El nombre del proveedor es obligatorio");
  }

  // Validación opcional de email
  if (email && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    throw new Error("Correo electrónico no válido");
  }

  // Evitar proveedores duplicados por nombre
  const existe = await Proveedor.findOne({ nombre: nombre.trim() });
  if (existe) throw new Error("Proveedor ya registrado");

  // Crear proveedor
  return Proveedor.create({ nombre: nombre.trim(), telefono, email, direccion });
}

/**
 * Listar todos los proveedores
 * @returns {Promise<Proveedor[]>}
 */
export async function listarProveedores() {
  return Proveedor.find().sort({ nombre: 1 }); // Orden alfabético por nombre
}

/**
 * Actualizar un proveedor por ID
 * @param {string} id - ID del proveedor a actualizar
 * @param {Object} data - { nombre, telefono, email, direccion }
 * @returns {Promise<Proveedor>}
 * @throws {Error} Si no se encuentra el proveedor
 */
export async function actualizarProveedor(id, data) {
  const proveedor = await Proveedor.findById(id);
  if (!proveedor) {
    throw new Error("Proveedor no encontrado");
  }

  // Actualizar campos permitidos
  proveedor.nombre = data.nombre?.trim() || proveedor.nombre;
  proveedor.telefono = data.telefono || proveedor.telefono;
  proveedor.email = data.email || proveedor.email;
  proveedor.direccion = data.direccion || proveedor.direccion;

  return proveedor.save();
}