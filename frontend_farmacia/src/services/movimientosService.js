
// ================================================================
// Servicio para la gestión de movimientos de inventario.
// ================================================================

import api from './api';

/**
 * Listar todos los movimientos de inventario
 * @returns {Promise<Array>} Lista de movimientos
 * @throws Lanza error si falla la petición
 */
export async function listarMovimientosAPI() {
  const res = await api.get('/movimientos');
  return res.data.items;
}


