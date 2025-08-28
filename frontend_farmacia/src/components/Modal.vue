<template>
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-card"> <!-- renombrado de modal-content -->
      <div class="modal-header">
        <slot name="header"></slot>
        <button @click="emit('close')" class="modal-close">&times;</button> <!-- renombrado de modal-close-btn -->
      </div>
      <div class="modal-form"> <!-- opcional: usar modal-form para cuerpo consistente -->
        <slot name="body"></slot>
      </div>
    </div>
  </div>
</template>


<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['close']);
</script>


