// ===========================================
// Servicio para la gestión de proveedores
// ===========================================

import api from "./api";

/**
 * Listar todos los proveedores
 * @returns {Promise<Array>} Array de proveedores
 */
export async function listarProveedores() {
  const res = await api.get("/proveedores");
  return res.data.items || res.data; // Asegura compatibilidad con distintas respuestas del backend
}

/**
 * Crear un nuevo proveedor
 * @param {Object} data - Datos del proveedor { nombre: string }
 * @returns {Promise<Object>} Proveedor creado
 */
export async function crearProveedor(data) {
  const res = await api.post("/proveedores", data);
  return res.data;
}

export const actualizarProveedor = async (id, data) => {
  const response = await api.put(`/proveedores/${id}`, data);
  return response.data;
};