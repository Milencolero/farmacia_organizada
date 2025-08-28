// src/services/solicitudesService.js
// ===========================================
// Servicio para gestión de solicitudes
// ===========================================

import api from "./api.js";

/**
 * Crear una nueva solicitud
 * @param {Object} data - Datos de la solicitud { items: [], observaciones: string }
 * @returns {Promise<Object>} Solicitud creada
 */
export async function crearSolicitud(data) {
  try {
    const res = await api.post("/solicitudes", data);
    return res.data;
  } catch (error) {
    console.error("Error al crear la solicitud:", error);
    throw error;
  }
}

/**
 * Listar solicitudes
 * @param {Object} filters - Filtros opcionales { usuarioId, estado }
 * @returns {Promise<Array>} Array de solicitudes
 */
export async function listarSolicitudes(filters = {}) {
  try {
    const res = await api.get("/solicitudes", { params: filters });
    return res.data.items;
  } catch (error) {
    console.error("Error al listar solicitudes:", error);
    throw error;
  }
}

/**
 * Actualizar estado de una solicitud (APROBADA o RECHAZADA)
 * @param {string} id - ID de la solicitud
 * @param {string} estado - Nuevo estado
 * @returns {Promise<Object>} Solicitud actualizada
 */
export async function actualizarEstadoSolicitud(id, estado) {
  try {
    const res = await api.patch(`/solicitudes/${id}/estado`, { estado });
    return res.data;
  } catch (error) {
    console.error("Error al actualizar el estado de la solicitud:", error);
    throw error;
  }
}

/**
 * Aprobar y entregar una solicitud (flujo completo)
 * @param {string} solicitudId - ID de la solicitud
 * @returns {Promise<Object>} Entrega generada
 */
export async function aprobarYEntregarAPI(solicitudId) {
  try {
    const res = await api.post(`/solicitudes/${solicitudId}/aprobar-y-entregar`);
    return res.data;
  } catch (error) {
    console.error("Error al aprobar y entregar la solicitud:", error);
    throw error;
  }
}

/**
 * Entregar una solicitud aprobada
 * @param {string} solicitudId - ID de la solicitud
 * @returns {Promise<Object>} Entrega generada
 */
export async function entregarSolicitud(solicitudId) {
  try {
    const res = await api.post(`/solicitudes/${solicitudId}/entregar`);
    return res.data;
  } catch (error) {
    console.error("Error al entregar la solicitud:", error);
    throw error;
  }
}
