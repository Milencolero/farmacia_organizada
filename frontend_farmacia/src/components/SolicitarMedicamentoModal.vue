<template>
  <div v-if="props.show" class="modal-overlay">
    <div class="modal-card">
      <!-- Header -->
      <div class="modal-header">
        <h2>Solicitar Medicamentos</h2>
        <button class="modal-close" @click="cerrarModal">&times;</button>
      </div>

      <!-- Búsqueda -->
      <input
        type="text"
        placeholder="Buscar medicamento..."
        class="input w-full mb-2"
        v-model="searchTerm"
      />

      <!-- Lista de disponibles -->
      <ul v-if="disponibles.length" class="lista-disponibles">
        <li
          v-for="m in disponibles"
          :key="m._id"
          class="lista-item"
          @click="agregarMedicamento(m)"
        >
          <span>{{ m.nombre }}</span>
          <span>{{ m.stockTotal }} disponibles</span>
        </li>
      </ul>
      <p v-else class="text-muted mb-2">No hay medicamentos disponibles que coincidan.</p>

      <!-- Seleccionados -->
      <div v-if="seleccionados.length" class="seleccionados">
        <div
          v-for="(item, idx) in seleccionados"
          :key="item.medicamentoId"
          class="seleccionado-item"
        >
          <div class="flex justify-between items-center">
            <strong>{{ item.medicamento.nombre }}</strong>
            <button @click="quitarMedicamento(item.medicamentoId)" class="text-destructive hover:text-destructive/80">
              X
            </button>
          </div>

          <div class="flex gap-2 items-center mt-1">
            <button @click="disminuirCantidad(item)" class="btn px-2 py-1">-</button>
            <span>{{ item.cantidad }}</span>
            <button @click="aumentarCantidad(item)" class="btn px-2 py-1">+</button>
            <input type="text" placeholder="Propósito" v-model="item.proposito" class="input flex-1" />
          </div>

          <span v-if="errores[`proposito_${idx}`]" class="text-destructive text-sm">
            {{ errores[`proposito_${idx}`] }}
          </span>
        </div>
      </div>

      <p v-if="errores.items" class="text-destructive mb-2">{{ errores.items }}</p>

      <!-- Observaciones -->
      <textarea
        placeholder="Observaciones..."
        v-model="observaciones"
        class="input w-full mb-4"
      ></textarea>
      <span v-if="errores.observaciones" class="text-destructive text-sm">
  {{ errores.observaciones }}
</span>

      <!-- Footer -->
      <div class="modal-footer">
        <button @click="cerrarModal" class="btn btn-outline">Cancelar</button>
        <button @click="enviarSolicitud" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Enviando...' : 'Enviar' }}
        </button>
      </div>
      <p v-if="mensajeExito" class="text-correct mb-2">{{ mensajeExito }}</p>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import * as inventarioService from '@/services/inventarioService';
import * as solicitudService from '@/services/solicitudService';

interface Medicamento { _id: string; nombre: string; stockTotal: number; }
interface ItemSeleccionado { medicamentoId: string; medicamento: Medicamento; cantidad: number; proposito: string; }

const props = defineProps<{ show: boolean; onClose: () => void; }>();

const loading = ref(false);
const medicamentos = ref<Medicamento[]>([]);
const searchTerm = ref('');
const seleccionados = reactive<ItemSeleccionado[]>([]);
const observaciones = ref('');
const errores = reactive<{ [key: string]: string }>({});
const mensajeExito = ref('');


/** Cargar medicamentos desde servicio */
const cargarMedicamentos = async () => {
  loading.value = true;
  try {
    const result = await inventarioService.listarMedicamentos();
    medicamentos.value = Array.isArray(result) ? result : [];
  } catch (e) {
    console.error('Error al cargar medicamentos:', e);
    medicamentos.value = [];
    alert('No se pudieron cargar los medicamentos.');
  } finally {
    loading.value = false;
  }
};

/** Reset al cerrar modal */
const cerrarModal = () => {
  seleccionados.splice(0);
  observaciones.value = '';
  Object.keys(errores).forEach(k => errores[k] = '');
  searchTerm.value = '';
  props.onClose();
};

/** Medicamentos filtrados por búsqueda y no seleccionados */
const disponibles = computed(() =>
  medicamentos.value.filter(m =>
    m.stockTotal > 0 &&
    !seleccionados.some(s => s.medicamentoId === m._id) &&
    m.nombre.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
);

const agregarMedicamento = (med: Medicamento) => {
  seleccionados.push({ medicamentoId: med._id, medicamento: med, cantidad: 1, proposito: '' });
  searchTerm.value = '';
};
const quitarMedicamento = (id: string) => {
  const index = seleccionados.findIndex(s => s.medicamentoId === id);
  if (index >= 0) seleccionados.splice(index, 1);
};
const ajustarCantidad = (item: ItemSeleccionado, delta: number) => {
  const nuevaCantidad = item.cantidad + delta;
  if (nuevaCantidad >= 1 && nuevaCantidad <= item.medicamento.stockTotal) item.cantidad = nuevaCantidad;
};
const aumentarCantidad = (item: ItemSeleccionado) => ajustarCantidad(item, +1);
const disminuirCantidad = (item: ItemSeleccionado) => ajustarCantidad(item, -1);

/** Validación antes de enviar */
const validar = () => {
  let valido = true;
  errores.items = '';
  errores.observaciones = '';

  // Validar medicamentos seleccionados
  if (seleccionados.length === 0) {
    errores.items = 'Debe seleccionar al menos un medicamento';
    valido = false;
  }

  // Validar propósito de cada medicamento
  seleccionados.forEach((item, idx) => {
    const key = `proposito_${idx}`;
    if (!item.proposito.trim()) {
      errores[key] = 'El propósito es obligatorio';
      valido = false;
    } else {
      errores[key] = '';
    }
  });

  // Validar observaciones (mínimo 5 caracteres)
  if (!observaciones.value.trim() || observaciones.value.length < 5) {
    errores.observaciones = 'Debe ingresar observaciones (mínimo 5 caracteres)';
    valido = false;
  } else {
    errores.observaciones = '';
  }

  return valido;
};


/** Envía la solicitud */
const enviarSolicitud = async () => {
  if (!validar()) return;



  loading.value = true;
  try {
    await solicitudService.crearSolicitud({
      items: seleccionados.map(s => ({ medicamentoId: s.medicamentoId, cantidad: s.cantidad, proposito: s.proposito })),
      observaciones: observaciones.value
    });
    mensajeExito.value = 'Solicitud enviada correctamente';
setTimeout(() => {
  mensajeExito.value = '';
    cerrarModal();
    }, 2000);
  } catch (e) {
    console.error('Error al enviar solicitud:', e);
    alert('No se pudo enviar la solicitud.');
  } finally {
    loading.value = false;
  }
};

/** Watch para cargar medicamentos al abrir modal */
watch(() => props.show, val => { if (val) cargarMedicamentos(); });
</script>

<style scoped>
.lista-disponibles {
  max-height: 160px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 1rem;
}

.lista-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
}
.lista-item:hover { background-color: var(--accent)/10; }

.seleccionados { display: flex; flex-direction: column; gap: 0.5rem; }
.seleccionado-item { border: 1px solid var(--border); padding: 0.5rem; border-radius: var(--radius); }
.text-destructive { color: #dc2626; }
.text-correct { color: #50ab0aff; }
</style>
