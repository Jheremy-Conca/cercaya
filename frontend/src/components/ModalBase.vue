<template>
  <Teleport to="body">
    <div class="modal-fondo" @click.self="cerrar">
      <div class="modal-caja" role="dialog" aria-modal="true">
        <button class="cerrar" @click="cerrar" aria-label="Cerrar">×</button>
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';

const emit = defineEmits(['cerrar']);
const cerrar = () => emit('cerrar');

const alPresionarTecla = (e) => {
  if (e.key === 'Escape') cerrar();
};

onMounted(() => document.addEventListener('keydown', alPresionarTecla));
onUnmounted(() => document.removeEventListener('keydown', alPresionarTecla));
</script>

<style scoped>
.modal-fondo {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-caja {
  background: var(--color-background);
  color: var(--color-text);
  border-radius: 10px;
  padding: 1.5rem;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.cerrar {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
}
</style>