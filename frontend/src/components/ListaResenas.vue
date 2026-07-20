<template>
  <div class="lista-resenas">
    <p v-if="!resenas.length" class="vacio">Todavía no hay reseñas. ¡Sé el primero en escribir una!</p>

    <article v-for="resena in resenas" :key="resena.id" class="resena">
      <header>
        <strong>{{ resena.usuario?.nombre || 'Usuario' }}</strong>
        <EstrellasRating :model-value="resena.rating" readonly />
        <time>{{ formatearFecha(resena.fecha) }}</time>
      </header>
      <p>{{ resena.comentario }}</p>
      <div class="fotos" v-if="resena.fotos?.length">
        <img v-for="foto in resena.fotos" :key="foto.id" :src="foto.url" :alt="`Foto de ${resena.usuario?.nombre}`" />
      </div>
      <div class="acciones-propias" v-if="resena.usuario?.id === usuarioActualId">
        <button @click="$emit('editar', resena)">Editar</button>
        <button class="eliminar" @click="$emit('eliminar', resena)">Eliminar</button>
      </div>
    </article>
  </div>
</template>

<script setup>
import EstrellasRating from './EstrellasRating.vue';

defineProps({
  resenas: { type: Array, default: () => [] },
  usuarioActualId: { type: [String, Number], default: null },
});
defineEmits(['editar', 'eliminar']);

const formatearFecha = (fecha) =>
  new Date(fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
</script>

<style scoped>
.resena { border-bottom: 1px solid var(--color-border); padding: 1rem 0; }
.resena header { display: flex; align-items: center; gap: 0.75rem; }
.resena time { font-size: 0.8rem; color: var(--color-text); opacity: 0.6; margin-left: auto; }
.fotos { display: flex; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap; }
.fotos img { width: 80px; height: 80px; object-fit: cover; border-radius: 6px; }
.vacio { color: var(--color-text); opacity: 0.6; }
.acciones-propias { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
.acciones-propias button {
  font-size: 0.8rem;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
  color: var(--color-text);
}
.acciones-propias .eliminar { border-color: var(--color-danger); color: var(--color-danger); }
</style>