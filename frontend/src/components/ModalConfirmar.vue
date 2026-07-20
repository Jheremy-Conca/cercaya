<template>
  <ModalBase @cerrar="$emit('cancelar')">
    <div class="confirmar">
      <h3>{{ titulo }}</h3>
      <p>{{ mensaje }}</p>
      <div class="acciones">
        <button type="button" @click="$emit('cancelar')">Cancelar</button>
        <button type="button" class="peligro" :disabled="procesando" @click="confirmar">
          {{ procesando ? 'Eliminando...' : textoConfirmar }}
        </button>
      </div>
    </div>
  </ModalBase>
</template>

<script setup>
import { ref } from 'vue';
import ModalBase from './ModalBase.vue';

const props = defineProps({
  titulo: { type: String, default: '¿Estás seguro?' },
  mensaje: { type: String, default: 'Esta acción no se puede deshacer.' },
  textoConfirmar: { type: String, default: 'Eliminar' },
  alConfirmar: { type: Function, required: true }, // función async que hace la eliminación real
});
const emit = defineEmits(['cancelar', 'confirmado']);

const procesando = ref(false);

const confirmar = async () => {
  procesando.value = true;
  try {
    await props.alConfirmar();
    emit('confirmado');
  } finally {
    procesando.value = false;
  }
};
</script>

<style scoped>
.confirmar { display: flex; flex-direction: column; gap: 1rem; }
.acciones { display: flex; justify-content: flex-end; gap: 0.75rem; }
.peligro {
  background: var(--color-danger);
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}
</style>