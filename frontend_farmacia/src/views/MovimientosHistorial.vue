<template>
  <div class="container">
    <!-- Encabezado de dashboard -->
    <DashboardHeader />

    <!-- Título de la página -->
    <h1 class="page-title">Movimientos de Stock</h1>

    <!-- Estado: cargando -->
    <div v-if="loading" class="message info">
      Cargando historial...
    </div>

    <!-- Estado: sin resultados -->
    <div v-else-if="!movimientos.length" class="message info">
      No se encontraron movimientos.
    </div>

    <!-- Tabla de resultados -->
    <div v-else class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Medicamento</th>
            <th>Cantidad</th>
            <th>Usuario</th>
            <th>Fecha</th>
            <th>Lote</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="movimiento in movimientos" :key="movimiento._id">
            <td>{{ movimiento.tipo }}</td>
            <td>{{ movimiento.medicamentoId?.nombre || "Medicamento Eliminado" }}</td>
            <td>{{ movimiento.cantidad }}</td>
            <td>{{ movimiento.usuarioId?.nombre || "Usuario Eliminado" }}</td>
            <td>{{ formatDate(movimiento.fechaMovimiento) }}</td>
            <td>{{ movimiento.lote || "N/A" }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
/**
 * Página de historial de movimientos de stock.
 * - Obtiene movimientos desde la API
 * - Muestra estados de carga y vacío
 * - Renderiza tabla con validaciones por campos eliminados o nulos
 */

import { ref, onMounted } from "vue";
import { listarMovimientosAPI } from "@/services/movimientosService";
import DashboardHeader from "@/components/DashboardHeader.vue";

// Estado local
const movimientos = ref([]); // Historial de movimientos
const loading = ref(true);   // Indicador de carga

/**
 * Obtiene los movimientos de stock desde la API.
 * Incluye validación defensiva en caso de error o formato inesperado.
 */
const fetchMovimientos = async () => {
  loading.value = true;
  try {
    const data = await listarMovimientosAPI();
    movimientos.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error al listar movimientos:", error);
    movimientos.value = [];
  } finally {
    loading.value = false;
  }
};

// Da formato legible a una fecha.
const formatDate = (dateString) =>
  dateString
    ? new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Fecha no disponible";

// Ejecutar carga inicial al montar el componente
onMounted(fetchMovimientos);

</script>

<style scoped>
.actions-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}
</style>
