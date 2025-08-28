import * as service from "../services/solicitudesService.js";

/**
 * Crear una nueva solicitud
 * @param {Request} req 
 * @param {Response} res 
 */
export async function crearSolicitud(req, res) {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) return res.status(401).json({ error: "Usuario no autenticado" });

    const { items, observaciones } = req.body || {};

    // Validaciones
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "La solicitud debe incluir al menos un medicamento" });
    }

    // Validar cada item
    for (const item of items) {
      if (!item.medicamentoId) return res.status(400).json({ error: "Cada item debe tener un medicamentoId" });
      if (!item.cantidad || item.cantidad <= 0) return res.status(400).json({ error: "Cantidad debe ser mayor a 0" });
    }

    const solicitud = await service.crearSolicitud(usuarioId, items, observaciones?.trim() || "");
    res.status(201).json(solicitud);

  } catch (err) {
    console.error("Error crearSolicitud:", err);
    res.status(400).json({ error: err.message });
  }
}

/**
 * Listar solicitudes
 * Permite filtrar por usuario o estado
 */
export async function listarSolicitudes(req, res) {
  try {
    const filter = {};
    if (req.query.usuarioId) filter.usuarioId = req.query.usuarioId;
    if (req.query.estado) filter.estado = req.query.estado;

    const solicitudes = await service.listarSolicitudes(filter);
    res.json({ items: solicitudes });

  } catch (err) {
    console.error("Error listarSolicitudes:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

/**
 * Cambiar estado de una solicitud
 */
export async function cambiarEstado(req, res) {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!id) return res.status(400).json({ error: "ID de la solicitud es obligatorio" });
    if (!estado || !["PENDIENTE","APROBADA","RECHAZADA","ENTREGADA"].includes(estado)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    const solicitud = await service.cambiarEstadoSolicitud(id, estado);
    res.json(solicitud);

  } catch (err) {
    console.error("Error cambiarEstado:", err);
    res.status(400).json({ error: err.message });
  }
}

/**
 * Entregar una solicitud aprobada
 */
export async function entregarSolicitud(req, res) {
  try {
    const { id } = req.params;
    const usuarioId = req.user?.id;
    if (!usuarioId) return res.status(401).json({ error: "Usuario no autenticado" });

    const solicitud = await service.listarSolicitudes({ _id: id });
    if (!solicitud.length) return res.status(404).json({ error: "Solicitud no encontrada" });
    if (solicitud[0].estado !== "APROBADA") {
      return res.status(400).json({ error: "Solo se pueden entregar solicitudes aprobadas" });
    }

    const entrega = await service.entregarSolicitud(solicitud[0], usuarioId);
    res.json(entrega);

  } catch (err) {
    console.error("Error entregarSolicitud:", err);
    res.status(400).json({ error: err.message });
  }
}

/**
 * Aprobar y entregar una solicitud en un solo paso
 */
export async function aprobarYEntregar(req, res) {
  try {
    const { id } = req.params;
    const usuarioId = req.user?.id;
    if (!usuarioId) return res.status(401).json({ error: "Usuario no autenticado" });

    const entrega = await service.aprobarYEntregar(id, usuarioId);
    res.status(200).json(entrega);

  } catch (err) {
    console.error("Error aprobarYEntregar:", err);
    res.status(400).json({ error: err.message });
  }
}
