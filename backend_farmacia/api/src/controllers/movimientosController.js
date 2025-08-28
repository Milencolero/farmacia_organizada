import Movimiento from "../models/Movimiento.js";
import Medicamento from "../models/Medicamento.js";
import User from "../models/User.js";

// Listar todos los movimientos
export async function listarMovimientos(req, res) {
  try {
    const movimientos = await Movimiento.find()
      .populate("medicamentoId", "nombre") // trae solo el nombre del medicamento
      .populate("usuarioId", "nombre rol") // trae nombre y rol del usuario
      .sort({ fechaMovimiento: -1 }); // orden descendente por fecha

    res.json({ items: movimientos });
  } catch (err) {
    console.error("Error listando movimientos:", err);
    res.status(500).json({ error: "Error al obtener movimientos" });
  }
}
