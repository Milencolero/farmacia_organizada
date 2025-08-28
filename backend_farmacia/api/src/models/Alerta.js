import mongoose from "mongoose";

/**
 * Esquema Alerta
 * Representa alertas generadas para medicamentos por vencimiento o bajo stock.
 */
const AlertaSchema = new mongoose.Schema({
  medicamentoId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Medicamento", 
    required: [true, "El medicamento asociado a la alerta es obligatorio"] 
  },
  tipo: { 
    type: String, 
    enum: {
      values: ["VENCIMIENTO", "BAJO_STOCK"],
      message: "El tipo de alerta debe ser 'VENCIMIENTO' o 'BAJO_STOCK'"
    },
    required: [true, "El tipo de alerta es obligatorio"] 
  },
  fechaGeneracion: { 
    type: Date, 
    default: () => new Date(),
    validate: {
      validator: function(value) {
        return value <= new Date(); // No permitir fechas futuras
      },
      message: "La fecha de generación no puede ser futura"
    }
  },
  estado: { 
    type: String, 
    enum: {
      values: ["ABIERTA", "RESUELTA"],
      message: "El estado de la alerta debe ser 'ABIERTA' o 'RESUELTA'"
    },
    default: "ABIERTA"
  },
  descripcion: { 
    type: String, 
    trim: true,
    default: ""
  }
}, { timestamps: true });

export default mongoose.model("Alerta", AlertaSchema);
