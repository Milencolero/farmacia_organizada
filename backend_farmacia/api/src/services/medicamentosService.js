import Medicamento from "../models/Medicamento.js";
import Movimiento from "../models/Movimiento.js";
import Proveedor from "../models/Proveedor.js";

/**
 * Crear un nuevo medicamento y registrar movimientos iniciales
 * @param {object} data - Datos del medicamento { nombre, proveedorId, umbralBajoStock, lotes }
 * @param {string} usuarioId - ID del usuario que realiza la acción
 * @returns {Promise<Document>} Medicamento creado
 * @throws {Error} Si faltan datos o proveedor no existe
 */
export async function crear(data, usuarioId) {
  const { nombre, proveedorId, umbralBajoStock, lotes } = data || {};
  if (!nombre || !proveedorId) throw new Error("Datos incompletos: nombre y proveedor son obligatorios");

  // Validar proveedor
  const proveedorExistente = await Proveedor.findById(proveedorId);
  if (!proveedorExistente) throw new Error("ID de proveedor no válido");

  // Calcular stock total
  const stockTotal = (lotes || []).reduce((sum, lote) => sum + (lote.cantidad || 0), 0);

  // Crear medicamento
  const medicamentoCreado = await Medicamento.create({
    nombre,
    proveedorId,
    umbralBajoStock: umbralBajoStock || 10,
    lotes: lotes || [],
    stockTotal
  });

  // Registrar movimientos de ingreso
  for (const lote of lotes || []) {
    if (lote.cantidad > 0) {
      await Movimiento.create({
        tipo: "INGRESO",
        medicamentoId: medicamentoCreado._id,
        lote: lote.lote,
        cantidad: lote.cantidad,
        usuarioId,
        fechaMovimiento: lote.fechaIngreso ? new Date(lote.fechaIngreso) : new Date()
      });
    }
  }

  return medicamentoCreado;
}

/**
 * Agrega un lote a un medicamento existente
 * @param {string} id - ID del medicamento
 * @param {object} loteData - { lote, cantidad, fechaIngreso, fechaVencimiento }
 * @param {string} usuarioId - ID del usuario que realiza la acción
 * @returns {Promise<Document>} Medicamento actualizado
 * @throws {Error} Si faltan datos o el lote está vencido
 */
export async function agregarLote(id, { lote, cantidad, fechaIngreso, fechaVencimiento }, usuarioId) {
  if (!lote || !cantidad || !fechaIngreso || !fechaVencimiento) {
    throw new Error("Datos incompletos: lote, cantidad, fechaIngreso y fechaVencimiento son obligatorios");
  }

  if (new Date(fechaVencimiento) < new Date()) throw new Error("No se puede ingresar un lote vencido");

  const med = await Medicamento.findById(id);
  if (!med) throw new Error("Medicamento no encontrado");

  const existente = (med.lotes || []).find(l => l.lote === lote);
  if (existente) existente.cantidad += Number(cantidad);
  else med.lotes.push({ lote, cantidad: Number(cantidad), fechaIngreso: new Date(fechaIngreso), fechaVencimiento: new Date(fechaVencimiento) });

  med.stockTotal = (med.lotes || []).reduce((s, l) => s + l.cantidad, 0);
  await med.save();

  await Movimiento.create({ tipo: "INGRESO", medicamentoId: med._id, lote, cantidad: Number(cantidad), usuarioId });
  return med;
}

/**
 * Elimina un medicamento
 * @param {string} id - ID del medicamento
 * @returns {Promise<object>} Mensaje de confirmación
 */
export async function eliminar(id) {
  const med = await Medicamento.findById(id);
  if (!med) throw new Error("Medicamento no encontrado");
  await med.deleteOne();
  return { message: "Medicamento eliminado" };
}

/**
 * Lista todos los medicamentos
 * @returns {Promise<Array<Document>>} Lista de medicamentos
 */
export async function listar() {
  return Medicamento.find().populate("proveedorId", "nombre").sort({ nombre: 1 });
}

/**
 * Encuentra medicamentos con stock bajo
 * @returns {Promise<Array<Document>>} Lista de medicamentos con stock bajo
 */
export async function stockBajo() {
  return Medicamento.find({ $expr: { $lt: ["$stockTotal", "$umbralBajoStock"] } });
}

/**
 * Encuentra medicamentos próximos a vencer
 * @param {number} dias - Número de días para el vencimiento
 * @returns {Promise<Array<Document>>} Lista de medicamentos próximos a vencer
 */
export async function porVencer(dias = 30) {
  const hoy = new Date();
  const fechaLimite = new Date();
  fechaLimite.setDate(hoy.getDate() + dias);
  return Medicamento.find({ "lotes.fechaVencimiento": { $lte: fechaLimite, $gte: hoy } });
}

/**
 * Actualiza un medicamento por ID
 * @param {string} id - ID del medicamento
 * @param {object} data - Datos a actualizar
 * @returns {Promise<Document>} Medicamento actualizado
 * @throws {Error} Si el medicamento no existe
 */
export async function actualizar(id, data) {
  const med = await Medicamento.findByIdAndUpdate(id, data, { new: true });
  if (!med) throw new Error("Medicamento no encontrado");

  return Medicamento.findById(med._id).populate("proveedorId", "nombre");
}
