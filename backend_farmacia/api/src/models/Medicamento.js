import mongoose from "mongoose";

/**
 * Subdocumento Lote
 * Representa un lote específico de un medicamento con cantidad y fechas de ingreso y vencimiento.
 */
const LoteSchema = new mongoose.Schema({
  lote: { 
    type: String, 
    required: [true, "El número de lote es obligatorio"], 
    trim: true 
  },
  cantidad: { 
    type: Number, 
    required: [true, "La cantidad del lote es obligatoria"], 
    min: [0, "La cantidad no puede ser negativa"] 
  },
  fechaIngreso: { 
    type: Date, 
    required: [true, "La fecha de ingreso es obligatoria"] 
  },
  fechaVencimiento: { 
    type: Date, 
    required: [true, "La fecha de vencimiento es obligatoria"],
    validate: {
      validator: function(value) {
        // La fecha de vencimiento debe ser mayor a la fecha de ingreso
        return this.fechaIngreso ? value > this.fechaIngreso : true;
      },
      message: "La fecha de vencimiento debe ser posterior a la fecha de ingreso"
    }
  }
}, { _id: false });

/**
 * Esquema Medicamento
 * Contiene información general de un medicamento, sus lotes y estado de stock.
 */
const MedicamentoSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: [true, "El nombre del medicamento es obligatorio"], 
    trim: true 
  },
  proveedorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Proveedor", 
    required: [true, "El proveedor es obligatorio"] 
  },
  lotes: { 
    type: [LoteSchema], 
    default: [],
    validate: {
      validator: function(value) {
        // Evita lotes con cantidad 0 o vacíos
        return value.every(lote => lote.cantidad > 0);
      },
      message: "Cada lote debe tener una cantidad mayor a 0"
    }
  },
  stockTotal: { 
    type: Number, 
    default: 0, 
    min: [0, "El stock total no puede ser negativo"] 
  },
  umbralBajoStock: { 
    type: Number, 
    default: 100, 
    min: [0, "El umbral de stock bajo no puede ser negativo"] 
  },
  activo: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true // Crea createdAt y updatedAt automáticamente
});

// Índice de texto para búsqueda por nombre
MedicamentoSchema.index({ nombre: "text" });

export default mongoose.model("Medicamento", MedicamentoSchema);
