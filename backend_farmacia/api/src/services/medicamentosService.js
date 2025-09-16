import Medicamento from "../models/Medicamento.js";
import Movimiento from "../models/Movimiento.js";
import Proveedor from "../models/Proveedor.js";
import mongoose from "mongoose";

/**
 * Crear un nuevo medicamento y registrar movimientos iniciales
 */
export async function crear(data, usuarioId = null) {
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
    umbralBajoStock: umbralBajoStock ?? 10,
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
        usuarioId: usuarioId || null,
        fechaMovimiento: lote.fechaIngreso ? new Date(lote.fechaIngreso) : new Date()
      });
    }
  }

  return medicamentoCreado;
}

/**
 * Agrega un lote a un medicamento existente
 */
export async function agregarLote(id, { lote, cantidad, fechaIngreso, fechaVencimiento }, usuarioId = null) {
  if (!lote || cantidad === undefined || !fechaIngreso || !fechaVencimiento) {
    throw new Error("Datos incompletos: lote, cantidad, fechaIngreso y fechaVencimiento son obligatorios");
  }

  if (new Date(fechaVencimiento) < new Date()) throw new Error("No se puede ingresar un lote vencido");

  const med = await Medicamento.findById(id);
  if (!med) throw new Error("Medicamento no encontrado");

  const existente = (med.lotes || []).find(l => l.lote === lote);
  if (existente) {
    existente.cantidad += Number(cantidad);
  } else {
    med.lotes.push({
      lote,
      cantidad: Number(cantidad),
      fechaIngreso: new Date(fechaIngreso),
      fechaVencimiento: new Date(fechaVencimiento)
    });
  }

  med.stockTotal = (med.lotes || []).reduce((s, l) => s + l.cantidad, 0);
  await med.save();

  await Movimiento.create({
    tipo: "INGRESO",
    medicamentoId: med._id,
    lote,
    cantidad: Number(cantidad),
    usuarioId: usuarioId || null,
    fechaMovimiento: new Date()
  });

  return med;
}

/**
 * Elimina un medicamento (marcar como inactivo)
 */
export async function eliminar(id, usuarioId = null) {
  const med = await Medicamento.findById(id);
  if (!med) throw new Error("Medicamento no encontrado");

  med.activo = false;
  await med.save();

  await Movimiento.create({
    tipo: "EGRESO",
    medicamentoId: med._id,
    cantidad: med.stockTotal,
    usuarioId: usuarioId || null,
    fechaMovimiento: new Date(),
    lote: "Eliminación"
  });

  return { message: "Medicamento marcado como eliminado y registrado" };
}

/**
 * Lista todos los medicamentos
 */
export async function listar() {
  return Medicamento.find().populate("proveedorId", "nombre").sort({ nombre: 1 });
}

/**
 * Encuentra medicamentos con stock bajo
 */
export async function stockBajo() {
  return Medicamento.find({ $expr: { $lt: ["$stockTotal", "$umbralBajoStock"] } });
}

/**
 * Encuentra medicamentos próximos a vencer
 */
export async function porVencer(dias = 30) {
  const hoy = new Date();
  const fechaLimite = new Date();
  fechaLimite.setDate(hoy.getDate() + dias);
  return Medicamento.find({ "lotes.fechaVencimiento": { $lte: fechaLimite, $gte: hoy } });
}

/**
 * Actualiza un medicamento y sus lotes
 */
export async function actualizar(id, data, usuarioId = null) {
  const med = await Medicamento.findById(id);
  if (!med) throw new Error("Medicamento no encontrado");

  // Campos generales
  med.nombre = data.nombre ?? med.nombre;
  med.proveedorId = data.proveedorId ?? med.proveedorId;
  med.umbralBajoStock = data.umbralBajoStock ?? med.umbralBajoStock;

  // Procesar lotes con operaciones explícitas
  if (Array.isArray(data.lotes)) {
    for (const lote of data.lotes) {
      if (!lote.lote || lote.cantidad === undefined || !lote.fechaVencimiento) continue;

      if (lote.operacion === "AGREGAR") {
        med.lotes.push({
          lote: lote.lote,
          cantidad: lote.cantidad,
          fechaIngreso: lote.fechaIngreso ? new Date(lote.fechaIngreso) : new Date(),
          fechaVencimiento: new Date(lote.fechaVencimiento)
        });

        await Movimiento.create({
          tipo: "INGRESO",
          medicamentoId: med._id,
          cantidad: lote.cantidad,
          usuarioId: usuarioId || null,
          fechaMovimiento: new Date(),
          lote: lote.lote
        });

      } else if (lote.operacion === "MODIFICAR") {
        const existente = med.lotes.find(l => l.lote === lote.lote);
        if (existente) {
          const diferencia = lote.cantidad - existente.cantidad;
          if (diferencia !== 0) {
            await Movimiento.create({
              tipo: diferencia > 0 ? "INGRESO" : "EGRESO",
              medicamentoId: med._id,
              cantidad: Math.abs(diferencia),
              usuarioId: usuarioId || null,
              fechaMovimiento: new Date(),
              lote: lote.lote
            });
          }
          existente.cantidad = lote.cantidad;
          existente.fechaVencimiento = new Date(lote.fechaVencimiento);
        }
      } else if (lote.operacion === "ELIMINAR") {
        med.lotes = med.lotes.filter(l => l.lote !== lote.lote);
        await Movimiento.create({
          tipo: "EGRESO",
          medicamentoId: med._id,
          cantidad: lote.cantidad,
          usuarioId: usuarioId || null,
          fechaMovimiento: new Date(),
          lote: lote.lote
        });
      }
    }
  }

  // Recalcular stock total
  med.stockTotal = med.lotes.reduce((s, l) => s + l.cantidad, 0);
  await med.save();

  return Medicamento.findById(med._id).populate("proveedorId", "nombre");
}
