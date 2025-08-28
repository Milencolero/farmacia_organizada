import mongoose from "mongoose";

/**
 * Esquema Movimiento
 * Representa un registro de ingreso o egreso de medicamentos.
 * Incluye referencia al medicamento, lote, cantidad, usuario responsable y observaciones opcionales.
 */
const MovimientoSchema = new mongoose.Schema({
  tipo: { 
    type: String, 
    enum: {
      values: ["INGRESO", "EGRESO"],
      message: "El tipo de movimiento debe ser 'INGRESO' o 'EGRESO'"
    },
    required: [true, "El tipo de movimiento es obligatorio"] 
  },
  medicamentoId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Medicamento", 
    required: [true, "El medicamento es obligatorio"] 
  },
  lote: { 
    type: String, 
    trim: true,
    default: null
  },
  cantidad: { 
    type: Number, 
    required: [true, "La cantidad es obligatoria"], 
    min: [1, "La cantidad debe ser mayor a 0"] 
  },
  fechaMovimiento: { 
    type: Date, 
    default: () => new Date(),
    validate: {
      validator: function(value) {
        return value <= new Date(); // No permitir fechas futuras
      },
      message: "La fecha del movimiento no puede ser futura"
    }
  },
  usuarioId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: [true, "El usuario responsable es obligatorio"] 
  },
  observaciones: { 
    type: String, 
    trim: true,
    default: ""
  }
}, { timestamps: true });

export default mongoose.model("Movimiento", MovimientoSchema);
