<template>
  <div class="card card-alerta">
    <!-- Header de la tarjeta de alertas -->
    <h3 class="alerta-header">
      <AlertCircle class="alerta-icon" />
      Alertas de Vencimiento
    </h3>

    <!-- Mensajes de estado -->
    <div v-if="loading" class="message info italic">Cargando alertas...</div>
    <div v-else-if="error" class="error-text italic">{{ error }}</div>
    <div v-else-if="alertas.length === 0" class="message info italic">
      No hay medicamentos próximos a vencer.
    </div>

    <!-- Lista de alertas por medicamento -->
    <ul v-else class="alertas-list">
      <li v-for="alerta in alertas" :key="alerta._id" class="alerta-item">
        <div class="status-badge">
          {{ alerta.nombre }} ({{ alerta.lotes.length }} lotes)
        </div>

        <!-- Lotes del medicamento -->
        <ul class="pl-4 mt-2">
          <li
            v-for="lote in alerta.lotes"
            :key="lote._id || lote.lote"
            :class="['lote-item', loteUrgente(lote.fechaVencimiento) ? 'lote-urgente' : '']"
          >
            <span>Lote: {{ lote.lote || 'N/A' }}</span>
            <span>Cantidad: {{ Number(lote.cantidad) || 0 }}</span>
            <span>Vence: {{ formatDate(lote.fechaVencimiento) }}</span>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script setup>
/**
 * Componente de alertas de vencimiento de medicamentos.
 *  - Carga los medicamentos con lotes próximos a vencer (30 días).
 *  - Muestra estados: cargando, error, sin alertas.
 *  - Marca como urgente los lotes que vencen en menos de 7 días.
 */

import { ref, onMounted } from 'vue';
import { listarPorVencer } from '@/services/inventarioService';
import { AlertCircle } from 'lucide-vue-next';

// Estado reactivo
const alertas = ref([]);
const loading = ref(true);
const error = ref(null);

//Formatea una fecha a formato local chileno.
const formatDate = (fecha) => {
  const d = new Date(fecha);
  return !isNaN(d.getTime()) ? d.toLocaleDateString('es-CL') : 'N/A';
};

 //Determina si un lote es urgente (vence en menos de 7 días) 
const loteUrgente = (fecha) => {
  if (!fecha) return false;
  const hoy = new Date();
  const vencimiento = new Date(fecha);
  if (isNaN(vencimiento.getTime())) return false;

  const diffDias = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
  return diffDias <= 7;
};

/**
 * Obtiene los medicamentos próximos a vencer.
 * - Considera solo lotes dentro de los próximos 30 días.
 * - Filtra y mapea datos para garantizar consistencia.
 */
const fetchAlertas = async () => {
  loading.value = true;
  error.value = null;

  try {
    const data = await listarPorVencer();

    const hoy = new Date();
    const limite = new Date();
    limite.setDate(hoy.getDate() + 30);

    alertas.value = data
      .map((med) => {
        const lotesProximos = (med.lotes || []).filter((lote) => {
          const fecha = new Date(lote.fechaVencimiento);
          return !isNaN(fecha.getTime()) && fecha >= hoy && fecha <= limite;
        });

        return {
          _id: med._id,
          nombre: med.nombre || 'Sin nombre',
          lotes: lotesProximos,
        };
      })
      .filter((med) => med.lotes.length > 0);

  } catch (err) {
    console.error('Error al cargar alertas:', err);
    error.value = err?.message || 'No se pudieron cargar las alertas';
  } finally {
    loading.value = false;
  }
};

// Carga inicial de alertas al montar el componente
onMounted(fetchAlertas);
</script>

<style scoped>
.card-alerta {
  background-color: #fff8e1; /* amarillo-naranja suave */
  padding: 1.5rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.alerta-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: var(--font-weight-medium);
  color: #b45309; /* naranja oscuro */
}

.alerta-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #d97706; /* naranja medio para icono */
}

.alertas-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.alerta-item {
  padding: 0.75rem 0;
  border-bottom: 1px dashed #fbbf24; /* borde naranja */
}

.status-badge {
  font-size: 0.875rem;
  color: #92400e; /* naranja medio para texto */
}

.lote-item {
  display: flex;
  gap: 1.5rem;
  font-size: 0.875rem;
  color: #92400e;
  padding: 0.25rem 0;
}

.lote-urgente {
  background-color: #fcd34d33; /* amarillo-anaranjado semi-transparente */
  border-left: 4px solid #dc2626; /* borde rojo intenso */
  padding-left: 0.5rem;
  border-radius: 4px;
  color: #7c2d12; /* naranja oscuro para letras urgentes */
}
</style>
