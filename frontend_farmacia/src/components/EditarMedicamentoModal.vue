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
          <!-- Nombre del medicamento -->
          <div class="form-group">
            <label>Nombre</label>
            <input v-model.trim="nombre" type="text" required placeholder="Nombre del medicamento"/>
          </div>

          <!-- Proveedor -->
          <div class="form-group">
            <label>Proveedor</label>
            <select v-model="proveedorId" required>
              <option value="">--Seleccione--</option>
              <option v-for="p in proveedores" :key="p._id" :value="p._id">
                {{ p.nombre }}
              </option>
            </select>
          </div>

          <!-- Sección de lotes -->
          <div class="form-group" v-for="(l, index) in lotes" :key="l.id">
            <label>Lote</label>
            <input v-model="l.lote" type="text" required placeholder="Número de lote" />

            <label>Cantidad</label>
            <input v-model.number="l.cantidad" type="number" min="1" required />

            <label>Vencimiento</label>
            <input v-model="l.vencimiento" type="date" :min="fechaMinima" required />

            <button type="button" class="btn btn-outline btn-sm mt-1" @click="eliminarLote(index)">
              Eliminar lote
            </button>
          </div>

          <!-- Botón para agregar lote -->
          <button type="button" class="btn btn-secondary mt-2" @click="agregarLote">
            + Agregar lote
          </button>
        </div>

        <!-- Mensaje de error -->
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
import { useAuthStore } from "@/stores/auth";

// Props del componente
const props = defineProps({
  show: Boolean,
  medicamento: Object
});


const authStore = useAuthStore(); // acceder al store

// Eventos emitidos al padre
const emit = defineEmits(['close', 'updated']);

// Estados reactivos
const nombre = ref('');
const proveedorId = ref('');
const lotes = ref([]);
const proveedores = ref([]);
const loading = ref(false);
const error = ref('');

// Cargar proveedores al montar el componente
onMounted(async () => {
  try {
    proveedores.value = await listarProveedores();
  } catch (e) {
    console.error("Error al cargar proveedores:", e);
  }
});

// Sincronizar formulario con medicamento seleccionado
watch(() => props.medicamento, (med) => {
  if (med) {
    nombre.value = med.nombre || '';
    proveedorId.value = med.proveedorId?._id || '';
    lotes.value = (med.lotes || []).map(l => ({
      id: l.lote + Math.random(), // clave temporal para Vue
      lote: l.lote,
      cantidad: l.cantidad,
      vencimiento: l.fechaVencimiento?.substr(0,10)
    }));
  }
}, { immediate: true });

// Validación de formulario
const formValido = computed(() => {
  if (!nombre.value || !proveedorId.value || !lotes.value.length) return false;
  return lotes.value.every(l => l.lote && l.cantidad > 0 && l.vencimiento);
});

// Fecha mínima para vencimiento
const fechaMinima = computed(() => new Date().toISOString().split('T')[0]);

// Función para cerrar modal
const cerrar = () => {
  emit('close');
  error.value = '';
};

// Función para agregar un lote
const agregarLote = () => {
  lotes.value.push({
    id: Math.random(),
    lote: '',
    cantidad: 1,
    vencimiento: fechaMinima.value
  });
};

// Función para eliminar un lote
const eliminarLote = (index) => {
  lotes.value.splice(index, 1);
};

// Función para guardar cambios
const guardar = async () => {
  if (!formValido.value || !props.medicamento) return;
  loading.value = true;
  try {
    // Preparar lotes actualizados
    const lotesActualizados = lotes.value.map(l => ({
      lote: l.lote,
      cantidad: Number(l.cantidad),
      fechaVencimiento: l.vencimiento,
      fechaIngreso: new Date().toISOString()
    }));

    // Calcular stock total
    const stockTotal = lotesActualizados.reduce((sum, l) => sum + l.cantidad, 0);

    // Preparar objeto de medicamento actualizado
    const medActualizado = {
      ...props.medicamento,
      nombre: nombre.value,
      proveedorId: proveedorId.value,
      lotes: lotesActualizados,
      stockTotal
    };

   // Obtener el usuarioId desde el store
    const usuarioId = authStore.user?._id;
    if (!usuarioId) throw new Error("No hay usuario logeado");

    // Actualizar en backend
    const updated = await actualizarMedicamento(props.medicamento._id, {medActualizado, usuarioId});

    // Emitir evento al padre con el medicamento actualizado
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
.error-text { color: var(--destructive); font-size: 0.85rem; margin-top: 0.25rem; }
.modal-form-grid { display: grid; gap: 1rem; }
</style> 
