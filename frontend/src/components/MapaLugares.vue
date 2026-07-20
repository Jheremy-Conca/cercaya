<template>
  <div :id="idMapa" class="mapa"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix: Vite no resuelve automáticamente las rutas internas que Leaflet usa
// por defecto para sus iconos, así que se reasignan explícitamente.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const props = defineProps({
  lugares: { type: Array, default: () => [] },
  centro: { type: Array, default: () => [-12.0464, -77.0428] },
  zoom: { type: Number, default: 13 },
});

const idMapa = `mapa-${Math.random().toString(36).slice(2)}`;
const router = useRouter();

let mapa;
let marcadores = [];

const pintarMarcadores = () => {
  marcadores.forEach((m) => m.remove());
  marcadores = [];

  props.lugares.forEach((lugar) => {
    if (!lugar.latitud || !lugar.longitud) return;
    const marcador = L.marker([lugar.latitud, lugar.longitud])
      .addTo(mapa)
      .bindPopup(`<strong>${lugar.nombre}</strong><br>${lugar.categoria}`);

    marcador.on('click', () => router.push({ name: 'lugar-detalle', params: { id: lugar.id } }));
    marcadores.push(marcador);
  });
};

onMounted(() => {
  mapa = L.map(idMapa).setView(props.centro, props.zoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(mapa);
  pintarMarcadores();
});

watch(() => props.lugares, pintarMarcadores);
onBeforeUnmount(() => mapa?.remove());
</script>

<style scoped>
.mapa {
  height: 400px;
  border-radius: 8px;
}
</style>