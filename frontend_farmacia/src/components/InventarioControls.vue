<template>
  <div class="inventario-controls" v-bind="$attrs">
    <!-- Barra de búsqueda -->
    <div class="inventario-controls__search">
      <Search class="inventario-controls__icon" />
      <input
        :value="modelValue"
        @input="onInput"
        type="text"
        placeholder="Buscar medicamentos o número de lote..."
        class="inventario-controls__input"
      />
    </div>

    <!-- Botones -->
    <div class="inventario-controls__buttons">
      <!-- Solicitar medicamento (disponible para todos los roles) -->
      <button
        @click="$emit('request-meds')"
        class="btn btn-primary inventario-controls__btn"
      >
        <ShoppingCart class="inventario-controls__btn-icon" />
        Solicitar medicamento
      </button>

      <!-- Agregar medicamento (solo ADMIN) -->
      <button
        v-if="authStore.userRole?.toLowerCase() === 'admin'"
        @click="$emit('add-med')"
        class="btn btn-primary inventario-controls__btn"
      >
        <Plus class="inventario-controls__btn-primary" />
        Agregar medicamento
      </button>
    </div>
  </div>
</template>

<script setup>
import { Search, ShoppingCart, Plus } from 'lucide-vue-next';
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();

// Props
const props = defineProps({
  modelValue: { type: String, default: '' } // Valor del input de búsqueda
});

// Eventos emitidos
const emits = defineEmits(['update:modelValue', 'request-meds', 'add-med']);

// Función que emite valor de búsqueda limpio (trim)
const onInput = (event) => {
  const value = event.target.value.trimStart(); // evita espacios iniciales
  emits('update:modelValue', value);
};
</script>

<style scoped>
.inventario-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  margin-top: 1rem;
}

/* Barra de búsqueda */
.inventario-controls__search {
  position: relative;
  flex: 1 1 auto;
  min-width: 180px;
  max-width: 400px;
}

.inventario-controls__icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--muted-foreground);
}

.inventario-controls__input {
  width: 100%;
  padding: 0.6rem 0.8rem 0.6rem 2.5rem;
  border-radius: var(--radius);
  border: 1px solid #ccc;
  background-color: var(--muted);
  font-size: 0.95rem;
  color: var(--foreground);
}

.inventario-controls__input:focus {
  outline: 2px solid var(--primary);
}

.inventario-controls__buttons {
  display: flex;       
  gap: 0.75rem;        
  flex-wrap: wrap;     
}

</style>
