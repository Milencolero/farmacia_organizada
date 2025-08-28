import mongoose from "mongoose";

/**
 * Esquema Proveedor
 * Contiene la información básica de un proveedor de medicamentos.
 * Se asegura que el nombre sea único y obligatorio, y valida algunos formatos básicos.
 */
const ProveedorSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: [true, "El nombre del proveedor es obligatorio"], 
    unique: true, 
    trim: true 
  },
  telefono: { 
    type: String, 
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // campo opcional
        return /^[0-9+\-\s()]{7,20}$/.test(v); // solo números, +, -, paréntesis y espacios
      },
      message: "El número de teléfono no es válido"
    }
  },
  email: { 
    type: String, 
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // campo opcional
        return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: "El correo electrónico no es válido"
    }
  },
  direccion: { 
    type: String, 
    trim: true, 
    default: ""
  }
}, { timestamps: true });

export default mongoose.model("Proveedor", ProveedorSchema);
