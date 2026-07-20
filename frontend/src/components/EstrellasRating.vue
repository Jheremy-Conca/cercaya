<template>
  <div class="estrellas" :class="{ 'solo-lectura': readonly }">
    <span
      v-for="n in 5"
      :key="n"
      class="estrella"
      :class="{ activa: n <= valorMostrado }"
      @click="seleccionar(n)"
      @mouseenter="hover = n"
      @mouseleave="hover = 0"
    >★</span>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  readonly: { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue']);

const hover = ref(0);
const valorMostrado = computed(() => (props.readonly ? props.modelValue : hover.value || props.modelValue));

const seleccionar = (n) => {
  if (props.readonly) return;
  emit('update:modelValue', n);
};
</script>

<style scoped>
.estrellas { display: inline-flex; gap: 2px; }
.estrella { font-size: 1.3rem; color: #ccc; cursor: pointer; }
.solo-lectura .estrella { cursor: default; }
.estrella.activa { color: #f5a623; }
</style>