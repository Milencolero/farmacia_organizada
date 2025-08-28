import mongoose from "mongoose";

/**
 * Subdocumento DetalleEntrega
 * Representa cada medicamento entregado dentro de una entrega.
 */
const DetalleEntregaSchema = new mongoose.Schema({
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
  cantidadEntregada: { 
    type: Number, 
    required: [true, "La cantidad entregada es obligatoria"], 
    min: [1, "La cantidad entregada debe ser al menos 1"] 
  }
}, { _id: false });

/**
 * Esquema Entrega
 * Representa la entrega de una solicitud de medicamentos.
 * Cada entrega está vinculada a una solicitud y registra quién realizó la entrega.
 */
const EntregaSchema = new mongoose.Schema({
  solicitudId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Solicitud", 
    required: [true, "La solicitud asociada es obligatoria"], 
    unique: true 
  },
  detalles: { 
    type: [DetalleEntregaSchema],
    default: [],
    validate: {
      validator: function(value) {
        return value.length > 0; // No permitir entrega sin detalles
      },
      message: "La entrega debe incluir al menos un medicamento"
    }
  },
  fechaEntrega: { 
    type: Date, 
    default: () => new Date(),
    validate: {
      validator: function(value) {
        return value <= new Date(); // No permitir fechas futuras
      },
      message: "La fecha de entrega no puede ser futura"
    }
  },
  entregadoPor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: [true, "El usuario que realiza la entrega es obligatorio"] 
  }
}, { timestamps: true });

export default mongoose.model("Entrega", EntregaSchema);
