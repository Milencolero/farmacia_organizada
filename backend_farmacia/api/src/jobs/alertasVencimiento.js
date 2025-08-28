import cron from "node-cron";
import Medicamento from "../models/Medicamento.js";
import Alerta from "../models/Alerta.js";

/**
 * Inicializa el job de alertas de medicamentos
 * Se ejecuta diariamente a las 08:00 AM hora de Santiago
 * Genera alertas por:
 *   - Lotes próximos a vencer (<= 90 días)
 *   - Stock bajo (si se implementa en el futuro)
 */
export function iniciarJobAlertas() {
  cron.schedule("0 8 * * *", async () => {
    try {
      const limiteVencimiento = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 días desde hoy

      // Buscar medicamentos con al menos un lote por vencer
      const medicamentos = await Medicamento.find({ "lotes.fechaVencimiento": { $lte: limiteVencimiento } });

      for (const med of medicamentos) {
        // Verificar si ya existe alerta abierta de este tipo
        const alertaExistente = await Alerta.findOne({
          medicamentoId: med._id,
          tipo: "VENCIMIENTO",
          estado: "ABIERTA"
        });

        if (!alertaExistente) {
          // Crear nueva alerta
          await Alerta.create({
            medicamentoId: med._id,
            tipo: "VENCIMIENTO",
            descripcion: "Lotes próximos a vencer",
            estado: "ABIERTA"
          });
          console.log(`Alerta creada para medicamento: ${med.nombre}`);
        } else {
          // Actualizar fecha de generación si ya existe alerta
          alertaExistente.fechaGeneracion = new Date();
          await alertaExistente.save();
          console.log(`Alerta actualizada para medicamento: ${med.nombre}`);
        }
      }

    } catch (err) {
      console.error("Error en job de alertas:", err);
    }
  }, { timezone: "America/Santiago" });
}
