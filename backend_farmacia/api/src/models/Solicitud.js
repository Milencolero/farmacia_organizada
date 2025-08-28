import mongoose from "mongoose";

/**
 * Subdocumento Item
 * Representa un medicamento y la cantidad solicitada dentro de una solicitud.
 */
const ItemSchema = new mongoose.Schema({
  medicamentoId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Medicamento", 
    required: [true, "El medicamento es obligatorio"] 
  },
  cantidad: { 
    type: Number, 
    required: [true, "La cantidad es obligatoria"], 
    min: [1, "La cantidad debe ser al menos 1"] 
  }
}, { _id: false });

/**
 * Esquema Solicitud
 * Representa una solicitud de medicamentos realizada por un usuario.
 * Contiene los items solicitados, el estado de la solicitud y observaciones opcionales.
 */
const SolicitudSchema = new mongoose.Schema({
  usuarioId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: [true, "El usuario que realiza la solicitud es obligatorio"] 
  },
  items: { 
    type: [ItemSchema], 
    required: [true, "La solicitud debe contener al menos un item"],
    validate: {
      validator: function(value) {
        return value.length > 0; // No permitir array vacío
      },
      message: "La solicitud debe tener al menos un medicamento"
    }
  },
  estado: { 
    type: String, 
    enum: {
      values: ["PENDIENTE","APROBADA","RECHAZADA","ENTREGADA"],
      message: "El estado de la solicitud debe ser PENDIENTE, APROBADA, RECHAZADA o ENTREGADA"
    },
    default: "PENDIENTE"
  },
  observaciones: { 
    type: String, 
    trim: true,
    default: ""
  }
}, { timestamps: true });

export default mongoose.model("Solicitud", SolicitudSchema);
