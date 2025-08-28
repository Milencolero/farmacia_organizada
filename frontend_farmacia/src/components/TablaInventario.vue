<template>
  <div class="card tabla-inventario-card">
    <!-- Header de la tarjeta mostrando cantidad de medicamentos -->
    <div class="tabla-inventario__header">
      Inventario ({{ medications.length }} medicamentos)
    </div>

    <!-- Tabla de medicamentos -->
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>Medicamento</th>
            <th>Proveedor</th>
            <th>Cantidad</th>
            <th>Estado</th>
            <th>Vencimiento</th>
            <th>Lote</th>
            <th v-if="esAdmin">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <!-- Renderizado de cada medicamento -->
          <tr v-for="med in medications" :key="med._id">
            <td class="tabla-inventario__cell--bold">{{ med.nombre }}</td>
            <td>{{ med.proveedorId?.nombre || '-' }}</td>
            <td>{{ med.stockTotal ?? '-' }}</td>
            <td>
              <span
                class="status-badge"
                :class="med.stockTotal > med.umbralBajoStock ? 'bg-green-100' : 'bg-red-100'"
              >
                {{ med.stockTotal > med.umbralBajoStock ? 'En Stock' : 'Stock Bajo' }}
              </span>
            </td>
            <td>
              <ul v-if="med.lotes?.length">
                <li v-for="lote in med.lotes" :key="lote._id">
                  {{ formatearFecha(lote.fechaVencimiento) }}
                </li>
              </ul>
              <span v-else>-</span>
            </td>
            <td>
              <ul v-if="med.lotes?.length">
                <li v-for="lote in med.lotes" :key="lote._id">{{ lote.lote }}</li>
              </ul>
              <span v-else>-</span>
            </td>
            <td v-if="esAdmin">
              <button @click="$emit('abrir-editar', med)" class="btn btn-secondary">
                Editar
              </button>
            </td>
          </tr>

          <!-- Mensaje si no hay medicamentos -->
          <tr v-if="medications.length === 0">
            <td :colspan="esAdmin ? 7 : 6" class="tabla-inventario__empty">
              No se encontraron medicamentos que coincidan con sus criterios.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from "@/stores/auth";

// ===== Props y eventos =====
defineProps({
  medications: { type: Array, required: true },
});
defineEmits(['abrir-editar']);

// ===== Store de autenticación =====
const authStore = useAuthStore();

// ===== Computed: verificar si el usuario es administrador =====
const esAdmin = computed(() => authStore.userRole?.toLowerCase() === 'admin');

// ===== Formateo seguro de fechas =====
const formatearFecha = (fecha) => {
  if (!fecha) return '-';
  try {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    console.error("Error al formatear fecha:", fecha, e);
    return '-';
  }
};
</script>

<style scoped>
.tabla-inventario-card {
  padding: 1rem;
}

.tabla-inventario__header {
  font-weight: var(--font-weight-medium);
  margin-bottom: 1rem;
}

.tabla-inventario__cell--bold {
  font-weight: var(--font-weight-medium);
}
</style>
