<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-card">
      <!-- Header del modal -->
      <div class="modal-header">
        <h2>Agregar Nuevo Medicamento</h2>
        <button class="modal-close" @click="$emit('close')">&times;</button>
      </div>

      <!-- Mensajes de feedback visibles dentro del modal -->
      <div v-if="mensajeExito" class="alert success">{{ mensajeExito }}</div>
      <div v-if="mensajeError" class="alert error">{{ mensajeError }}</div>

      <!-- Formulario principal -->
      <form @submit.prevent="agregarMedicamento" class="modal-form">
        <!-- Datos generales del medicamento -->
        <div class="modal-form-grid">
          <div class="form-group">
            <label>Nombre del Medicamento</label>
            <input
              v-model.trim="form.nombre"
              type="text"
              placeholder="Ingrese el nombre"
              required
            />
          </div>

          <div class="form-group">
            <label>Proveedor</label>
            <select v-model="form.proveedorId" required>
              <option disabled value="">Selecciona un proveedor</option>
              <option v-for="p in proveedores" :key="p._id" :value="p._id">
                {{ p.nombre }}
              </option>
            </select>
          </div>
        </div>

        <!-- Sección de lotes -->
        <div class="mt-4">
          <h3 class="text-lg font-medium mb-2">Lotes</h3>

          <div v-for="(lote, index) in form.lotes" :key="index" class="lote-card">
            <div class="modal-form-grid">
              <div class="form-group">
                <label>Número de Lote</label>
                <input
                  v-model.trim="lote.lote"
                  type="text"
                  placeholder="Lote"
                  required
                />
              </div>

              <div class="form-group">
                <label>Cantidad</label>
                <input
                  v-model.number="lote.cantidad"
                  type="number"
                  min="1"
                  placeholder="Cantidad"
                  required
                />
              </div>

              <div class="form-group">
                <label>Fecha de Ingreso</label>
                <input
                  v-model="lote.fechaIngreso"
                  type="date"
                  :max="lote.fechaVencimiento || undefined"
                  required
                />
              </div>

              <div class="form-group">
                <label>Fecha de Vencimiento</label>
                <input
                  v-model="lote.fechaVencimiento"
                  type="date"
                  :min="lote.fechaIngreso || undefined"
                  required
                />
              </div>
            </div>

            <!-- Botón para remover lote -->
            <div class="flex justify-end">
              <button
                type="button"
                @click="removerLote(index)"
                class="btn-remove"
                :disabled="form.lotes.length === 1"
              >
                Remover
              </button>
            </div>
          </div>

          <!-- Botón para agregar un nuevo lote -->
          <button
            type="button"
            @click="agregarLote"
            class="btn btn-outline mt-2"
          >
            Agregar Lote
          </button>
        </div>

        <!-- Footer con botones -->
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" @click="$emit('close')">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary">
            Guardar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  show: Boolean,
  proveedores: { type: Array, default: () => [] },
});

const emit = defineEmits(['close', 'added']);

// Formulario reactivo con datos iniciales
const form = ref({
  nombre: '',
  proveedorId: '',
  lotes: [
    { lote: '', cantidad: 1, fechaIngreso: '', fechaVencimiento: '' }
  ],
});

// Mensajes de feedback visibles dentro del modal
const mensajeExito = ref('');
const mensajeError = ref('');

// Función para agregar un lote vacío
const agregarLote = () =>
  form.value.lotes.push({ lote: '', cantidad: 1, fechaIngreso: '', fechaVencimiento: '' });

// Función para remover un lote por índice
const removerLote = (index) => form.value.lotes.splice(index, 1);

// Validación completa del formulario
const validarFormulario = () => {
  if (!form.value.nombre || !form.value.proveedorId) {
    mensajeError.value = 'Completa todos los campos generales';
    return false;
  }

  // Validación por lote
  for (let i = 0; i < form.value.lotes.length; i++) {
    const lote = form.value.lotes[i];
    if (!lote.lote || !lote.cantidad || !lote.fechaIngreso || !lote.fechaVencimiento) {
      mensajeError.value = `Completa todos los campos del lote #${i + 1}`;
      return false;
    }
    if (new Date(lote.fechaVencimiento) <= new Date(lote.fechaIngreso)) {
      mensajeError.value = `El lote #${i + 1} tiene fecha de vencimiento menor que fecha de ingreso`;
      return false;
    }
  }

  // Si todo está correcto, limpiar mensaje de error
  mensajeError.value = '';
  return true;
};

// Función para enviar datos al padre y mostrar mensaje de éxito en el modal
const agregarMedicamento = () => {
  if (!validarFormulario()) {
    setTimeout(() => (mensajeError.value = ''), 3000); // Limpiar mensaje de error después de 3s
    return;
  }

  try {
    // Emitir evento con los datos del formulario
    emit('added', { ...form.value });

    // Mostrar mensaje de éxito dentro del modal
    mensajeExito.value = 'Medicamento agregado correctamente';

    // Resetear formulario para permitir agregar otro medicamento
    form.value = {
      nombre: '',
      proveedorId: '',
      lotes: [{ lote: '', cantidad: 1, fechaIngreso: '', fechaVencimiento: '' }]
    };

    // Limpiar mensaje de éxito después de 3 segundos
    setTimeout(() => (mensajeExito.value = ''), 3000);

    // NOTA: No se cierra el modal automáticamente, para que el usuario vea el mensaje

  } catch (e) {
    console.error(e);
    mensajeError.value = 'Error al guardar el medicamento';
    setTimeout(() => (mensajeError.value = ''), 3000);
  }
};
</script>

<style scoped>
.alert {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: 500;
}
.success {
  background: #d1fae5;
  color: #065f46;
}
.error {
  background: #fee2e2;
  color: #991b1b;
}
</style>
