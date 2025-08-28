import mongoose from "mongoose";

/**
 * Esquema User
 * Representa un usuario del sistema con credenciales, rol y estado activo.
 */
const UserSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: [true, "El nombre del usuario es obligatorio"], 
    trim: true 
  },
  correo: { 
    type: String, 
    required: [true, "El correo electrónico es obligatorio"], 
    unique: true, 
    lowercase: true, 
    trim: true,
    validate: {
      validator: function(v) {
        return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: "El correo electrónico no es válido"
    }
  },
  passwordHash: { 
    type: String, 
    required: [true, "La contraseña es obligatoria"] 
  },
  rol: { 
    type: String, 
    enum: {
      values: ["ADMIN", "TENS"],
      message: "El rol debe ser ADMIN o TENS"
    },
    required: [true, "El rol del usuario es obligatorio"] 
  },
  activo: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
