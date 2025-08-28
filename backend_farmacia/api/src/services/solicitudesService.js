import Solicitud from "../models/Solicitud.js";
import Medicamento from "../models/Medicamento.js";
import Entrega from "../models/Entrega.js";
import Movimiento from "../models/Movimiento.js";

/**
 * Crear una nueva solicitud de medicamentos
 * @param {string} usuarioId - ID del usuario que crea la solicitud
 * @param {Array} items - Lista de items { medicamentoId, cantidad }
 * @param {string} observaciones - Observaciones opcionales
 * @returns {Promise<Document>} Documento de la solicitud creada
 * @throws {Error} Si no se envía al menos un item
 */
export async function crearSolicitud(usuarioId, items, observaciones) {
  if (!items || !items.length) throw new Error("Debe enviar al menos un item");
  return Solicitud.create({ usuarioId, items, observaciones });
}

/**
 * Listar solicitudes con filtros opcionales
 * @param {object} filter - { usuarioId, estado, ... }
 * @returns {Promise<Array<Document>>} Lista de solicitudes con usuario e items populados
 */
export async function listarSolicitudes(filter) {
  return Solicitud.find(filter)
    .populate("usuarioId", "nombre email")
    .populate("items.medicamentoId", "nombre");
}

/**
 * Cambiar estado de una solicitud
 * @param {string} id - ID de la solicitud
 * @param {string} estado - "APROBADA" o "RECHAZADA"
 * @returns {Promise<Document>} Solicitud actualizada
 * @throws {Error} Si el estado no es válido o la solicitud no existe
 */
export async function cambiarEstadoSolicitud(id, estado) {
  if (!["APROBADA", "RECHAZADA"].includes(estado)) throw new Error("Estado inválido");
  const solicitud = await Solicitud.findById(id);
  if (!solicitud) throw new Error("Solicitud no encontrada");

  solicitud.estado = estado;
  await solicitud.save();
  return solicitud;
}

/**
 * Entregar una solicitud aprobada, registrando movimientos y actualizando stock
 * @param {Document} solicitud - Documento de la solicitud aprobada
 * @param {string} usuarioId - ID del usuario que realiza la entrega
 * @returns {Promise<Document>} Documento de la entrega
 * @throws {Error} Si no hay stock suficiente o se viola el mínimo
 */
export async function entregarSolicitud(solicitud, usuarioId) {
  const detalles = [];

  for (const item of solicitud.items) {
    const med = await Medicamento.findById(item.medicamentoId._id);

    // Validar stock mínimo
    if (med.stockTotal - item.cantidad < med.umbralBajoStock) {
      throw new Error(`No se puede entregar ${med.nombre}: stock mínimo (${med.umbralBajoStock})`);
    }

    // Seleccionar un lote con cantidad suficiente
    const loteDisponible = med.lotes.find(l => l.cantidad >= item.cantidad);
    if (!loteDisponible) throw new Error(`No hay stock suficiente para ${med.nombre}`);

    // Reducir cantidad del lote y actualizar stock total
    loteDisponible.cantidad -= item.cantidad;
    med.stockTotal = med.lotes.reduce((s, l) => s + l.cantidad, 0);
    await med.save();

    // Registrar detalle de entrega
    detalles.push({
      medicamentoId: med._id,
      lote: loteDisponible.lote,
      cantidadEntregada: item.cantidad
    });

    // Registrar movimiento de egreso
    await Movimiento.create({
      tipo: "EGRESO",
      medicamentoId: med._id,
      lote: loteDisponible.lote,
      cantidad: item.cantidad,
      usuarioId
    });
  }

  // Crear documento de entrega
  const entrega = await Entrega.create({
    solicitudId: solicitud._id,
    detalles,
    entregadoPor: usuarioId
  });

  // Actualizar estado de la solicitud a ENTREGADA
  solicitud.estado = "ENTREGADA";
  await solicitud.save();

  return entrega;
}

/**
 * Aprobar y entregar una solicitud en un solo flujo
 * @param {string} solicitudId - ID de la solicitud
 * @param {string} usuarioId - ID del usuario que realiza la acción
 * @returns {Promise<Document>} Documento de la entrega
 */
export async function aprobarYEntregar(solicitudId, usuarioId) {
  // Cambiar estado a APROBADA
  const solicitudAprobada = await cambiarEstadoSolicitud(solicitudId, "APROBADA");

  // Procesar la entrega
  return entregarSolicitud(solicitudAprobada, usuarioId);
}
