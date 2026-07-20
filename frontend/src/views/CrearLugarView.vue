<template>
  <div class="max-w-5xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-[var(--color-heading)] mb-6">
      {{ esEdicion ? 'Editar lugar' : 'Agregar un nuevo lugar' }}
    </h1>

    <div class="flex flex-wrap gap-8">
      <div class="flex-1 min-w-[320px]">
        <div id="mapa-crear" class="h-[400px] rounded-xl overflow-hidden border border-[var(--color-border)]"></div>
        <p class="text-sm text-[var(--color-text)] opacity-60 mt-2">Haz clic en el mapa para marcar la ubicación del lugar.</p>
      </div>

      <form class="flex-1 min-w-[280px] flex flex-col gap-5" @submit.prevent="enviarFormulario">
        <label class="flex flex-col gap-1.5">
          <span class="font-semibold text-[var(--color-heading)]">Nombre *</span>
          <input
            v-model="form.nombre"
            type="text"
            required
            class="bg-[var(--color-background-soft)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="font-semibold text-[var(--color-heading)]">Categoría *</span>
          <select
            v-model="form.categoria"
            required
            class="bg-[var(--color-background-soft)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option disabled value="">Selecciona una categoría</option>
            <option value="restaurante">Restaurante</option>
            <option value="cafe">Café</option>
            <option value="parque">Parque</option>
            <option value="tienda">Tienda</option>
            <option value="otro">Otro</option>
          </select>
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="font-semibold text-[var(--color-heading)]">Dirección</span>
          <input
            v-model="form.direccion"
            type="text"
            placeholder="Se autocompleta al hacer clic en el mapa"
            class="bg-[var(--color-background-soft)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-[var(--color-text)] placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="font-semibold text-[var(--color-heading)]">Descripción</span>
          <textarea
            v-model="form.descripcion"
            rows="3"
            class="bg-[var(--color-background-soft)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          ></textarea>
        </label>

        <div v-if="form.latitud && form.longitud" class="text-sm text-[var(--color-text)] opacity-70">
          Ubicación seleccionada: {{ form.latitud.toFixed(6) }}, {{ form.longitud.toFixed(6) }}
        </div>

        <button
          type="submit"
          :disabled="enviando || !form.latitud"
          class="mt-2 px-4 py-2.5 rounded-lg font-semibold text-white bg-primary hover:bg-primary-hover disabled:bg-[var(--color-background-mute)] disabled:text-[var(--color-text)] disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {{ enviando ? 'Guardando...' : (esEdicion ? 'Guardar cambios' : 'Guardar lugar') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { useLugaresStore } from '../stores/lugares';
import { useNotificar } from '../composables/useNotificar';

const props = defineProps({
  id: { type: [String, Number], default: null },
});

const router = useRouter();
const lugaresStore = useLugaresStore();
const { exito, error: notificarError } = useNotificar();

const esEdicion = computed(() => !!props.id);

const form = reactive({
  nombre: '',
  categoria: '',
  direccion: '',
  descripcion: '',
  latitud: null,
  longitud: null,
});

const enviando = ref(false);

let mapa;
let marcador;

const posicionarMarcador = (lat, lng) => {
  const latlng = { lat, lng };
  if (marcador) {
    marcador.setLatLng(latlng);
  } else {
    marcador = L.marker(latlng).addTo(mapa);
  }
  mapa.setView(latlng, 15);
};

onMounted(async () => {
  mapa = L.map('mapa-crear').setView([-12.0464, -77.0428], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(mapa);

  mapa.on('click', async (e) => {
    const { lat, lng } = e.latlng;
    form.latitud = lat;
    form.longitud = lng;

    if (marcador) {
      marcador.setLatLng(e.latlng);
    } else {
      marcador = L.marker(e.latlng).addTo(mapa);
    }

    await buscarDireccion(lat, lng);
  });

  if (esEdicion.value) {
    try {
      const lugar = await lugaresStore.obtenerPorId(props.id);
      form.nombre = lugar.nombre;
      form.categoria = lugar.categoria;
      form.direccion = lugar.direccion;
      form.descripcion = lugar.descripcion;
      form.latitud = Number(lugar.latitud);
      form.longitud = Number(lugar.longitud);
      posicionarMarcador(form.latitud, form.longitud);
    } catch (err) {
      console.error('Error cargando el lugar para editar:', err);
      notificarError('No se pudo cargar la información del lugar.');
    }
  }
});

const buscarDireccion = async (lat, lng) => {
  try {
    const { data } = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: { lat, lon: lng, format: 'json' },
    });
    form.direccion = data.display_name || form.direccion;
  } catch {
    // Si falla la geocodificación, el usuario puede escribir la dirección a mano
  }
};

const enviarFormulario = async () => {
  enviando.value = true;
  try {
    if (esEdicion.value) {
      await lugaresStore.editar(props.id, { ...form });
      exito('Lugar actualizado correctamente.');
      router.push({ name: 'lugar-detalle', params: { id: props.id } });
    } else {
      const nuevoLugar = await lugaresStore.crear({ ...form });
      exito('Lugar creado correctamente.');
      router.push({ name: 'lugar-detalle', params: { id: nuevoLugar.id } });
    }
  } catch (err) {
    notificarError(err.response?.data?.mensaje || 'Error al guardar el lugar.');
  } finally {
    enviando.value = false;
  }
};
</script>