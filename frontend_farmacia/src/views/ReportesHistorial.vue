<template>
  <div class="reportes-container">
    <!-- Header del dashboard -->
    <DashboardHeader />

    <main class="reportes-main">
      <h1 class="reportes-title">Solicitudes</h1>

      <!-- Filtros de búsqueda, estado y fecha -->
      <ReportesFilters
        v-model:search-term="searchTerm"
        v-model:filter-state="filterState"
        v-model:filter-date="filterDate"
        class="filters-container"
      />

      <!-- Mensajes de estado -->
      <div v-if="loading" class="status-message">Cargando solicitudes...</div>
      <div v-else-if="!solicitudes.length" class="status-message">No se encontraron solicitudes.</div>

      <!-- Lista de solicitudes filtradas -->
      <SolicitudesList
        v-else
        :solicitudes="filteredSolicitudes"
        :user-role="userRole"
        @aprobar="id => handleAccionSolicitud(id, 'APROBADA')"
        @rechazar="id => handleAccionSolicitud(id, 'RECHAZADA')"
        @entregar="id => handleAccionSolicitud(id, 'ENTREGAR')"
        class="solicitudes-container"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { listarSolicitudes, actualizarEstadoSolicitud, entregarSolicitud } from '@/services/solicitudService';
import DashboardHeader from '@/components/DashboardHeader.vue';
import ReportesFilters from '@/components/ReportesFilters.vue';
import SolicitudesList from '@/components/SolicitudesList.vue';
import { useAuthStore } from '@/stores/auth';

// ===== Estado y store =====
const authStore = useAuthStore();
const userRole = computed(() => authStore.userRole);
const solicitudes = ref([]);
const loading = ref(true);

// Filtros del usuario
const searchTerm = ref('');
const filterState = ref('Todos los Estados');
const filterDate = ref('Todas las fechas');

// ===== Cargar solicitudes desde API =====
const cargarSolicitudes = async () => {
  loading.value = true;
  try {
    const allSolicitudes = await listarSolicitudes();

    if (!Array.isArray(allSolicitudes)) {
      console.error("Respuesta API no es un array:", allSolicitudes);
      solicitudes.value = [];
      return;
    }

    // Filtrar por usuario si no es ADMIN
    const currentUserId = authStore.user?.id;
    solicitudes.value =
      userRole.value === 'ADMIN'
        ? allSolicitudes
        : allSolicitudes.filter(s => s.usuarioId?._id && String(s.usuarioId._id) === String(currentUserId));

  } catch (error) {
    console.error('Error al cargar solicitudes:', error);
    solicitudes.value = [];
  } finally {
    loading.value = false;
  }
};

// ===== Manejo de acciones sobre solicitudes =====
const handleAccionSolicitud = async (id, accion) => {
  try {
    if (accion === 'ENTREGAR') {
      await entregarSolicitud(id);
    } else {
      await actualizarEstadoSolicitud(id, accion);
    }
    // Recargar listado después de la acción
    await cargarSolicitudes();
  } catch (e) {
    console.error(`Error al ${accion.toLowerCase()} solicitud:`, e);
  }
};

// ===== Filtro de solicitudes según búsqueda, estado y fecha =====
const filteredSolicitudes = computed(() => {
  const now = new Date();

  return solicitudes.value.filter(s => {
    // Validar existencia de datos básicos
    if (!s.items || !s.createdAt) return false;

    // Filtro por término de búsqueda
    const matchesSearch =
      !searchTerm.value ||
      s.items.some(i => i.medicamentoId?.nombre?.toLowerCase().includes(searchTerm.value.toLowerCase()));

    // Filtro por estado
    const matchesState = filterState.value === 'Todos los Estados' || s.estado === filterState.value;

    // Filtro por fecha
    const fechaSolicitud = new Date(s.createdAt);
    let matchesDate = true;
    switch (filterDate.value) {
      case "Últimas 24 horas":
        matchesDate = fechaSolicitud >= new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "Últimos 7 días":
        matchesDate = fechaSolicitud >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "Últimos 30 días":
        matchesDate = fechaSolicitud >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    return matchesSearch && matchesState && matchesDate;
  });
});

// ===== Montaje inicial =====
onMounted(cargarSolicitudes);
</script>

<style scoped>
.reportes-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.reportes-main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filters-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.status-message {
  text-align: center;
  color: var(--muted-foreground);
  font-size: 0.95rem;
  padding: 1rem 0;
}

.solicitudes-container {
  flex: 1;
  min-height: 200px; /* evita colapso de contenedor */
  overflow-y: auto;
}
</style>
