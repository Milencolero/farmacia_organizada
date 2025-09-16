import * as service from "../services/medicamentosService.js";

/**
 * Crear un nuevo medicamento
 * @param {Request} req 
 * @param {Response} res 
 */
export async function crearMedicamento(req, res) {
  try {
    // Obtener el ID del usuario del token validado por el middleware
    const usuarioId = req.user?.id;
    if (!usuarioId) return res.status(401).json({ error: "Usuario no autenticado" });

    // Validar cuerpo de solicitud mínimo
    if (!req.body?.nombre || !req.body?.proveedorId) {
      return res.status(400).json({ error: "Nombre y proveedor son obligatorios" });
    }

    const med = await service.crear(req.body, usuarioId);
    res.status(201).json(med);

  } catch (err) {
    console.error("Error crearMedicamento:", err);
    res.status(400).json({ error: err.message });
  }
}

/**
 * Agregar lote a un medicamento existente
 */
export async function agregarLote(req, res) {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) return res.status(401).json({ error: "Usuario no autenticado" });

    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID de medicamento es obligatorio" });

    // Validación mínima del lote
    if (!req.body?.lote || !req.body?.cantidad) {
      return res.status(400).json({ error: "Lote y cantidad son obligatorios" });
    }

    const med = await service.agregarLote(id, req.body, usuarioId);
    res.json(med);

  } catch (err) {
    console.error("Error agregarLote:", err);
    res.status(400).json({ error: err.message });
  }
}

/**
 * Eliminar un medicamento
 */
export async function eliminarMedicamento(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID de medicamento es obligatorio" });

    const result = await service.eliminar(id);
    res.json(result);

  } catch (err) {
    console.error("Error eliminarMedicamento:", err);
    res.status(400).json({ error: err.message });
  }
}

/**
 * Listar todos los medicamentos
 */
export async function listarMedicamentos(req, res) {
  try {
    const meds = await service.listar();
    res.json({ items: meds });

  } catch (err) {
    console.error("Error listarMedicamentos:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * Obtener medicamentos con stock bajo
 */
export async function medicamentosStockBajo(req, res) {
  try {
    const meds = await service.stockBajo();
    res.json({ items: meds });

  } catch (err) {
    console.error("Error medicamentosStockBajo:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * Obtener medicamentos por vencer en X días
 */
export async function medicamentosPorVencer(req, res) {
  try {
    const dias = Number(req.query.dias) || 30;
    if (dias <= 0) return res.status(400).json({ error: "Número de días inválido" });

    const meds = await service.porVencer(dias);
    res.json({ items: meds });

  } catch (err) {
    console.error("Error medicamentosPorVencer:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * Actualizar información de un medicamento
 */
export async function actualizarMedicamento(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID de medicamento es obligatorio" });

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Datos a actualizar son obligatorios" });
    }

     const usuarioId = req.user?.id || req.user?._id;// 🔹 OJO, esto faltaba
    if (!usuarioId) return res.status(401).json({ error: "Usuario no autenticado" });

    const updatedMed = await service.actualizar(id, req.body, usuarioId); // 🔹 Pasar usuarioId al servicio
    res.json(updatedMed);

  } catch (err) {
    console.error("Error actualizarMedicamento:", err);
    res.status(400).json({ error: err.message });
  }
}
