<template>
  <div class="solicitudes-container">
    <!-- Itera sobre todas las solicitudes -->
    <div v-for="solicitud in solicitudes" :key="solicitud._id" class="solicitud-card">

      <!-- Header de la solicitud -->
      <div class="solicitud-header">
        <div class="solicitud-title">
          <span>Solicitud #{{ solicitud._id }}</span>
          <span :class="['estado-label', estadoClass(solicitud.estado)]">{{ solicitud.estado }}</span>
        </div>

        <!-- Detalles del usuario y fecha -->
        <div class="solicitud-details">
          <span class="detail-item">
            <User size="16" stroke="currentColor" />
            <span>{{ solicitud.usuarioId?.nombre || 'Usuario Eliminado' }}</span>
          </span>
          <span class="detail-item">
            <Calendar size="16" stroke="currentColor" />
            <span>{{ formatDate(solicitud.createdAt) }}</span>
          </span>
        </div>
      </div>

      <!-- Contenido de la solicitud -->
      <div class="solicitud-content">

        <!-- Lista de medicamentos -->
        <div class="medicamentos-section">
          <h4>Medicamentos Solicitados:</h4>
          <ul class="medicamentos-list">
            <li v-for="item in solicitud.items || []" :key="item._id" class="medicamento-item">
              <div class="med-nombre">
                {{ item.medicamentoId?.nombre || 'Medicamento Eliminado' }}
              </div>
              <div class="med-cantidades">
                <div>Solicitado: <span>{{ item.cantidad ?? '-' }}</span></div>
                <div v-if="item.cantidadAprobada !== undefined && item.cantidadAprobada !== null" class="aprobado">
                  Aprobado: <span>{{ item.cantidadAprobada }}</span>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <!-- Notas y respuestas -->
        <div class="notas-section">
          <h4>Notas y Respuesta:</h4>
          <div v-if="solicitud.observaciones" class="nota solicitante">
            <span class="nota-title">Notas del Solicitante:</span>
            <span>{{ solicitud.observaciones }}</span>
          </div>
          <div v-if="solicitud.respuesta" class="nota admin">
            <span class="nota-title">Respuesta del Administrador:</span>
            <span>{{ solicitud.respuesta }}</span>
          </div>
        </div>

      </div>

      <!-- Acciones según rol y estado -->
      <div class="acciones">
        <template v-if="userRole === 'ADMIN'">
          <template v-if="solicitud.estado === 'PENDIENTE'">
            <button @click="$emit('aprobar', solicitud._id)" class="btn btn-primary">Aprobar</button>
            <button @click="$emit('rechazar', solicitud._id)" class="btn btn-danger">Rechazar</button>
          </template>
          <template v-else-if="solicitud.estado === 'APROBADA'">
            <button @click="$emit('entregar', solicitud._id)" class="btn btn-secondary">Entregar</button>
          </template>
        </template>
      </div>

    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import { User, Calendar } from 'lucide-vue-next';

// ===== Props y eventos =====
const props = defineProps({
  solicitudes: { type: Array, default: () => [] },
  userRole: { type: String, default: "" },
});
const emit = defineEmits(["aprobar", "rechazar", "entregar"]);

// ===== Función para formatear fechas de forma segura =====
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (e) {
    console.error("Error al formatear fecha:", dateString, e);
    return '-';
  }
};

// ===== Función para asignar clases CSS según estado de la solicitud =====
const estadoClass = (estado) => {
  switch (estado) {
    case "APROBADA": return "estado-aprobada";
    case "RECHAZADA": return "estado-rechazada";
    case "PENDIENTE": return "estado-pendiente";
    case "ENTREGADA": return "estado-entregada";
    default: return "estado-otro";
  }
};
</script>

<style scoped>
.solicitudes-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.solicitud-card {
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  transition: box-shadow 0.2s;
}
.solicitud-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.solicitud-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
}
@media (min-width: 768px) {
  .solicitud-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.solicitud-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #111827;
  font-size: 1rem;
}
.estado-label {
  padding: 0.25rem 0.75rem;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 9999px;
}
.estado-aprobada { background: #d1fae5; color: #166534; }
.estado-rechazada { background: #fee2e2; color: #991b1b; }
.estado-pendiente { background: #fef3c7; color: #78350f; }
.estado-entregada { background: #dbeafe; color: #1e40af; }
.estado-otro { background: #f3f4f6; color: #374151; }

.solicitud-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}
.detail-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.solicitud-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
@media (min-width: 768px) {
  .solicitud-content { grid-template-columns: repeat(2, 1fr); }
}

.medicamentos-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.medicamento-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #fff;
}
.med-nombre { font-weight: 600; color: #111827; }
.med-cantidades { text-align: right; font-size: 0.8rem; color: #6b7280; }
.aprobado { color: #16a34a; font-weight: 600; }

.nota {
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid;
  font-size: 0.875rem;
}
.nota.solicitante { background: #f9fafb; border-color: #e5e7eb; }
.nota.admin { background: #eff6ff; border-color: #bfdbfe; }
.nota-title { font-weight: 600; color: #111827; }

.acciones {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
  border-top: 1px solid #f3f4f6;
  padding-top: 0.75rem;
}
</style>
