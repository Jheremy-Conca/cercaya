<template>
  <form class="form-resena" @submit.prevent="enviar">
    <h3>{{ resena ? 'Editar reseña' : 'Escribir reseña' }}</h3>

    <label>
      Calificación
      <EstrellasRating v-model="form.rating" />
    </label>

    <label>
      Comentario
      <textarea v-model="form.comentario" rows="4" required></textarea>
    </label>

    <label>
      Fotos (opcional)
      <input type="file" accept="image/*" multiple @change="alSeleccionarFotos" />
    </label>

    <p v-if="error" class="error">{{ error }}</p>

    <div class="acciones">
      <button type="button" @click="$emit('cerrar')">Cancelar</button>
      <button type="submit" :disabled="enviando || !form.rating">
        {{ enviando ? 'Guardando...' : 'Guardar reseña' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useResenasStore } from '../stores/resenas';
import EstrellasRating from './EstrellasRating.vue';

const props = defineProps({
  lugarId: { type: [String, Number], required: true },
  resena: { type: Object, default: null },
});
const emit = defineEmits(['guardado', 'cerrar']);

const resenasStore = useResenasStore();

const form = reactive({
  rating: props.resena?.rating || 0,
  comentario: props.resena?.comentario || '',
});
const fotos = ref([]);
const enviando = ref(false);
const error = ref(null);

const alSeleccionarFotos = (e) => {
  fotos.value = Array.from(e.target.files);
};

const enviar = async () => {
  enviando.value = true;
  error.value = null;
  try {
    let payload;
    if (fotos.value.length) {
      payload = new FormData();
      payload.append('rating', form.rating);
      payload.append('comentario', form.comentario);
      fotos.value.forEach((foto) => payload.append('fotos', foto));
    } else {
      payload = { rating: form.rating, comentario: form.comentario };
    }

    const resultado = props.resena
      ? await resenasStore.editar(props.resena.id, payload)
      : await resenasStore.crear(props.lugarId, payload);

    emit('guardado', resultado);
  } catch (err) {
    error.value = err.response?.data?.mensaje || 'Error al guardar la reseña.';
  } finally {
    enviando.value = false;
  }
};
</script>

<style scoped>
.form-resena { display: flex; flex-direction: column; gap: 1rem; }
label { display: flex; flex-direction: column; gap: 0.3rem; font-weight: 600; }
.acciones { display: flex; justify-content: flex-end; gap: 0.75rem; }
.error { color: #c0392b; }
</style>