<template>
  <div class="filters-container">
    <!-- Input de búsqueda -->
    <input 
      type="text" 
      placeholder="Buscar por solicitante o medicamento..." 
      class="filter-input" 
      :value="searchTerm"
      @input="$emit('update:searchTerm', $event.target.value)"
    />

    <!-- Selector de estado de solicitud -->
    <select 
      class="filter-select"
      :value="filterState"
      @change="$emit('update:filterState', $event.target.value)"
    >
      <option value="Todos los Estados">Todos los Estados</option>
      <option value="PENDIENTE">Pendiente</option>
      <option value="APROBADA">Aprobada</option>
      <option value="RECHAZADA">Rechazada</option>
      <option value="ENTREGADA">Entregada</option>
    </select>

    <!-- Selector de rango de fechas -->
    <select 
      class="filter-select"
      :value="filterDate"
      @change="$emit('update:filterDate', $event.target.value)"
    >
      <option value="Todas las fechas">Todas las fechas</option>
      <option value="Últimas 24 horas">Últimas 24 horas</option>
      <option value="Últimos 7 días">Últimos 7 días</option>
      <option value="Últimos 30 días">Últimos 30 días</option>
    </select>
  </div>
</template>

<script setup>
/**
 * Componente de filtros para la lista de solicitudes.
 * Permite filtrar por:
 *  - Texto (solicitante o medicamento)
 *  - Estado de la solicitud
 *  - Fecha de creación
 * 
 * Utiliza v-model con eventos personalizados para comunicación con el padre.
 */
import { defineProps, defineEmits } from 'vue';

defineProps({
  searchTerm: String,
  filterState: String,
  filterDate: String
});

defineEmits(['update:searchTerm', 'update:filterState', 'update:filterDate']);
</script>

<style scoped>
/* Contenedor de filtros */
.filters-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  padding: 1rem;
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* Estilos compartidos para input y select */
.filter-input,
.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #111827;
  background: #fff;
  height: 38px; /* misma altura para todos */
}

/* Input de búsqueda flexible */
.filter-input {
  flex: 1 1 250px; /* crece según espacio disponible */
  min-width: 200px;
}

/* Selects de tamaño fijo */
.filter-select {
  flex: 0 0 150px;
}
</style>
