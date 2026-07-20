<template>
  <RouterLink :to="{ name: 'lugar-detalle', params: { id: lugar.id } }" class="tarjeta">
    <h3>{{ lugar.nombre }}</h3>
    <span class="categoria">{{ lugar.categoria }}</span>
    <div class="rating">
      <EstrellasRating :model-value="Math.round(Number(lugar.ratingPromedio) || 0)" readonly /> <span class="cantidad"
        v-if="lugar.totalResenas">({{ lugar.totalResenas }})</span>
    </div>
    <p class="direccion" v-if="lugar.direccion">{{ lugar.direccion }}</p>
  </RouterLink>
</template>

<script setup>
import EstrellasRating from './EstrellasRating.vue';

defineProps({
  lugar: { type: Object, required: true },
});
</script>

<style scoped>
.tarjeta {
  display: block;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  background: var(--color-background);
  border-radius: 10px;
  padding: 1rem;
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.15s;
}

.tarjeta:hover {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.categoria {
  display: inline-block;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #888;
  margin: 0.25rem 0;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.cantidad {
  font-size: 0.85rem;
  color: #888;
}

.direccion {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.5rem;
}
</style>