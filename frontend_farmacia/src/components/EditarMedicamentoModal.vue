<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-card">
      <!-- Header -->
      <div class="modal-header">
        <h2>Editar Medicamento</h2>
        <button class="modal-close" @click="cerrar">&times;</button>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="guardar" class="modal-form">
        <div class="modal-form-grid">
          <div class="form-group">
            <label>Nombre</label>
            <input v-model.trim="nombre" type="text" required placeholder="Nombre del medicamento"/>
          </div>

          <div class="form-group">
            <label>Proveedor</label>
            <select v-model="proveedorId" required>
              <option value="">--Seleccione--</option>
              <option v-for="p in proveedores" :key="p._id" :value="p._id">
                {{ p.nombre }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Lote</label>
            <input v-model.trim="lote" type="text" required placeholder="Número de lote"/>
          </div>

          <div class="form-group">
            <label>Stock Total</label>
            <input v-model.number="stockTotal" type="number" min="1" required />
          </div>

          <div class="form-group">
            <label>Vencimiento</label>
            <input v-model="vencimiento" type="date" :min="fechaMinima" required />
          </div>
        </div>

        <p v-if="error" class="error-text">{{ error }}</p>

        <!-- Footer -->
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" @click="cerrar">Cancelar</button>
          <button type="submit" class="btn btn-primary" :disabled="loading || !formValido">
            {{ loading ? 'Actualizando...' : 'Actualizar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { listarProveedores } from "@/services/proveedoresService";
import { actualizarMedicamento } from "@/services/inventarioService";

const props = defineProps({
  show: Boolean,
  medicamento: Object
});

const emit = defineEmits(['close', 'updated']);

const nombre = ref('');
const stockTotal = ref(0);
const proveedorId = ref('');
const lote = ref('');
const vencimiento = ref('');
const proveedores = ref([]);
const loading = ref(false);
const error = ref('');

// Cargar proveedores al montar
onMounted(async () => {
  try { proveedores.value = await listarProveedores(); } 
  catch (e) { console.error(e); }
});

// Sincronizar formulario con medicamento
watch(() => props.medicamento, (med) => {
  if (med) {
    nombre.value = med.nombre || '';
    stockTotal.value = med.stockTotal || 0;
    proveedorId.value = med.proveedorId?._id || '';
    lote.value = med.lotes?.[0]?.lote || '';
    vencimiento.value = med.lotes?.[0]?.fechaVencimiento?.substr(0,10) || '';
  }
}, { immediate: true });

// Validaciones
const formValido = computed(() => {
  return nombre.value && proveedorId.value && lote.value && stockTotal.value > 0 && vencimiento.value;
});

// Fecha mínima de vencimiento (puede ser hoy)
const fechaMinima = computed(() => {
  const hoy = new Date();
  return hoy.toISOString().split('T')[0];
});

// Funciones
const cerrar = () => {
  emit('close');
  error.value = '';
};

const guardar = async () => {
  if (!formValido.value || !props.medicamento) return;
  loading.value = true;
  try {
    const medActualizado = { 
      ...props.medicamento, 
      nombre: nombre.value,
      proveedorId: proveedorId.value, 
      stockTotal: stockTotal.value 
    };

    // Actualizar lote
    const lotesCopia = [...(medActualizado.lotes || [])];
    const loteIndex = lotesCopia.findIndex(l => l.lote === lote.value);
    if (loteIndex !== -1) {
      lotesCopia[loteIndex].cantidad = stockTotal.value;
      lotesCopia[loteIndex].fechaVencimiento = vencimiento.value;
    } else {
      lotesCopia.push({
        lote: lote.value,
        cantidad: stockTotal.value,
        fechaIngreso: new Date().toISOString(),
        fechaVencimiento: vencimiento.value
      });
    }
    medActualizado.lotes = lotesCopia;

    const updated = await actualizarMedicamento(props.medicamento._id, medActualizado);
    emit('updated', updated);
    cerrar();
  } catch (err) {
    error.value = err.response?.data?.error || err.message || 'Error al actualizar';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>

/* Estilo específico para mensajes de error dentro del modal */
.error-text {
  color: var(--destructive);
  font-size: 0.85rem;
  margin-top: 0.25rem;
}
</style>
