// ================================================================
// Servicio para la gestión de inventario de medicamentos.
// Se comunica con la API a través de Axios y devuelve los datos
// ya desestructurados (items o documentos según corresponda).
// ================================================================

import api from "./api";

/**
 * Listar todos los medicamentos
 * @returns {Promise<Array>} Lista de medicamentos
 */
export async function listarMedicamentos() {
  const res = await api.get('/medicamentos');
  return res.data.items;
}

/**
 * Crear un nuevo medicamento
 * @param {Object} data - Datos del medicamento
 * @returns {Promise<Object>} Medicamento creado
 */
export async function crearMedicamento(data) {
  const res = await api.post('/medicamentos', data);
  return res.data;
}

/**
 * Agregar un lote a un medicamento existente
 * @param {string} medId - ID del medicamento
 * @param {Object} data - Datos del lote
 * @returns {Promise<Object>} Medicamento actualizado
 */
export async function agregarLote(medId, data) {
  const res = await api.post(`/medicamentos/${medId}/ingresos`, data);
  return res.data;
}

/**
 * Eliminar un medicamento por ID
 * @param {string} medId - ID del medicamento
 * @returns {Promise<Object>} Resultado de eliminación
 */
export async function eliminarMedicamento(medId) {
  const res = await api.delete(`/medicamentos/${medId}`);
  return res.data;
}

/**
 * Listar medicamentos con stock bajo
 * @returns {Promise<Array>} Lista de medicamentos con stock bajo
 */
export async function listarStockBajo() {
  const res = await api.get('/medicamentos/stock-bajo');
  return res.data.items;
}

/**
 * Listar medicamentos próximos a vencer
 * @param {number} dias - Número de días para filtrar vencimientos
 * @returns {Promise<Array>} Lista de medicamentos próximos a vencer
 */
export async function listarPorVencer(dias = 30) {
  const res = await api.get(`/medicamentos/vencer?dias=${dias}`);
  return res.data.items;
}

/**
 * Actualizar un medicamento por ID
 * @param {string} medId - ID del medicamento
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Medicamento actualizado
 */
export async function actualizarMedicamento(medId, data) {
  const res = await api.put(`/medicamentos/${medId}`, data);
  return res.data;
}

