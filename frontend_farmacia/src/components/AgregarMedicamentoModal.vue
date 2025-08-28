<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-card">
      <!-- Header -->
      <div class="modal-header">
        <h2>Agregar Nuevo Medicamento</h2>
        <button class="modal-close" @click="$emit('close')">&times;</button>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="agregarMedicamento" class="modal-form">
        <!-- Datos generales -->
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

        <!-- Lotes -->
        <div class="mt-4">
          <h3 class="text-lg font-medium mb-2">Lotes</h3>
          <div
            v-for="(lote, index) in form.lotes"
            :key="index"
            class="lote-card"
          >
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

          <button
            type="button"
            @click="agregarLote"
            class="btn btn-outline mt-2"
          >
            Agregar Lote
          </button>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" @click="$emit('close')">
            Cancelar
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="!formValido"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  show: Boolean,
  proveedores: { type: Array, default: () => [] },
});

const emit = defineEmits(['close', 'added']);

// Formulario reactivo
const form = ref({
  nombre: '',
  proveedorId: '',
  lotes: [
    { lote: '', cantidad: 1, fechaIngreso: '', fechaVencimiento: '' }
  ],
});

// Funciones para agregar/remover lotes
const agregarLote = () =>
  form.value.lotes.push({ lote: '', cantidad: 1, fechaIngreso: '', fechaVencimiento: '' });
const removerLote = (index) => form.value.lotes.splice(index, 1);

// Validaciones
const formValido = computed(() => {
  if (!form.value.nombre || !form.value.proveedorId) return false;
  return form.value.lotes.every(
    (l) =>
      l.lote &&
      l.cantidad > 0 &&
      l.fechaIngreso &&
      l.fechaVencimiento &&
      new Date(l.fechaVencimiento) >= new Date(l.fechaIngreso)
  );
});

// Enviar datos al padre
const agregarMedicamento = () => {
  if (!formValido.value) return;
  emit('added', { ...form.value });
  emit('close');
  // Reset del formulario
  form.value = {
    nombre: '',
    proveedorId: '',
    lotes: [{ lote: '', cantidad: 1, fechaIngreso: '', fechaVencimiento: '' }]
  };
};
</script>
