<template>
  <div class="container">
    <!-- Encabezado del dashboard -->
    <DashboardHeader />

    <!-- Título de la página -->
    <h1 class="page-title">Movimientos de Stock</h1>

    <!-- Barra de búsqueda y botón de descarga -->
    <div class="actions-header">
      <input
        type="text"
        v-model="searchTerm"
        placeholder="Buscar por medicamento, usuario o lote..."
        class="input-search"
      />
      <button @click="descargarPDF" class="btn ml-2">Descargar PDF</button>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="message info">
      Cargando historial...
    </div>

    <!-- Sin resultados -->
    <div v-else-if="!resultadosFiltrados.length" class="message info">
      No se encontraron movimientos.
    </div>

    <!-- Tabla de movimientos -->
    <div v-else class="table-wrapper" ref="contenidoPDF">
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
          <tr v-for="movimiento in resultadosFiltrados" :key="movimiento._id">
            <!-- Tipo de movimiento -->
            <td>{{ movimiento.tipo }}</td>

            <!-- Nombre del medicamento, mostrando "Eliminado" si ya no está activo -->
            <td>
              {{ movimiento.medicamentoId?.activo === false ? "Medicamento Eliminado" : movimiento.medicamentoId?.nombre || "N/A" }}
            </td>

            <!-- Cantidad del movimiento -->
            <td>{{ movimiento.cantidad }}</td>

            <!-- Nombre del usuario que realizó la acción -->
            <td>{{ movimiento.usuarioId?.nombre || "Usuario Eliminado" }}</td>

            <!-- Fecha del movimiento con formato legible -->
            <td>{{ formatDate(movimiento.fechaMovimiento) }}</td>

            <!-- Lote, indicando claramente si fue eliminado -->
            <td>
              {{ movimiento.lote === "Eliminación" ? "Lote Eliminado" : movimiento.lote || "N/A" }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
/**
 * Componente MovimientosStock.vue
 * - Muestra el historial completo de movimientos de stock de medicamentos
 * - Permite búsqueda por medicamento, usuario o lote
 * - Ordena los movimientos por fecha descendente
 * - Permite descargar el historial mostrado en PDF
 */

import { ref, computed, onMounted } from "vue";
import DashboardHeader from "@/components/DashboardHeader.vue";
import { listarMovimientosAPI } from "@/services/movimientosService";
import html2pdf from "html2pdf.js";

// Estado principal
const movimientos = ref([]);       // Historial completo
const loading = ref(true);         // Indicador de carga
const searchTerm = ref("");        // Filtro de búsqueda
const contenidoPDF = ref(null);    // Referencia para generar PDF

/**
 * Carga los movimientos desde la API
 * Maneja errores y asegura que siempre se tenga un array válido
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

/**
 * Computed que filtra los movimientos según el término de búsqueda
 * y ordena los resultados por fecha descendente
 */
const resultadosFiltrados = computed(() => {
  const term = searchTerm.value.toLowerCase();
  return movimientos.value
    .filter(m =>
      m.medicamentoId?.nombre?.toLowerCase().includes(term) ||
      m.usuarioId?.nombre?.toLowerCase().includes(term) ||
      (m.lote || "").toLowerCase().includes(term)
    )
    .sort((a, b) => new Date(b.fechaMovimiento) - new Date(a.fechaMovimiento));
});

/**
 * Da formato legible a una fecha ISO
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Fecha legible o mensaje si no está disponible
 */
const formatDate = (dateString) => {
  return dateString
    ? new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Fecha no disponible";
};

/**
 * Genera y descarga un PDF del historial mostrado
 */
const descargarPDF = () => {
  if (!contenidoPDF.value) return;

  const opciones = {
    margin: 0.5,
    filename: "movimientos_stock.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "a4", orientation: "landscape" },
  };

  html2pdf().set(opciones).from(contenidoPDF.value).save();
};

// Carga inicial de movimientos al montar el componente
onMounted(fetchMovimientos);
</script>

<style scoped>
.actions-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-right: 1rem;
}

.input-search {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--border);
  width: 300px;
}

.ml-2 {
  margin-left: 0.5rem;
}

.table-wrapper {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
}
</style>
