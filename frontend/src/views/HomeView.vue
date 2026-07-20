  <template>
    <div class="max-w-6xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-[var(--color-heading)] mb-6">Lugares cerca de ti</h1>

      <div class="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div class="flex flex-wrap gap-2">
          <button v-for="cat in categorias" :key="cat.valor ?? 'todos'" @click="filtrar(cat.valor)" :class="[
            'px-4 py-1.5 rounded-full border text-sm font-medium transition',
            categoriaSeleccionada === cat.valor && !modoCercania
              ? 'bg-primary text-white border-primary'
              : 'bg-[var(--color-background-soft)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-border-hover)]',
          ]">
            {{ cat.etiqueta }}
          </button>
        </div>

        <button @click="alternarCercania" :disabled="buscandoUbicacion" :class="[
          'px-4 py-1.5 rounded-full border text-sm font-medium transition disabled:opacity-50',
          modoCercania
            ? 'bg-primary text-white border-primary'
            : 'bg-[var(--color-background-soft)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-border-hover)]',
        ]">
          {{ buscandoUbicacion ? 'Ubicando...' : (modoCercania ? '✕ Cerca de mí' : '📍 Cerca de mí') }}
        </button>
      </div>

      <p v-if="errorUbicacion" class="text-red-500 mb-4">{{ errorUbicacion }}</p>

      <div class="rounded-xl overflow-hidden border border-[var(--color-border)] mt-2">
        <MapaLugares :lugares="lugaresVisibles" :centro="centroMapa" />
      </div>

      <p v-if="lugaresStore.cargando || buscandoUbicacion" class="text-[var(--color-text)] opacity-70 mt-4">
        Cargando lugares...
      </p>
      <p v-else-if="lugaresStore.error" class="text-red-500 mt-4">{{ lugaresStore.error }}</p>
      <p v-else-if="!lugaresVisibles.length" class="text-[var(--color-text)] opacity-60 italic mt-4">
        No se encontraron lugares.
      </p>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        <TarjetaLugar v-for="lugar in lugaresVisibles" :key="lugar.id" :lugar="lugar" />
      </div>
    </div>
  </template>

  <script setup>
  import { computed, onMounted, ref } from 'vue';
  import { useLugaresStore } from '../stores/lugares';
  import MapaLugares from '../components/MapaLugares.vue';
  import TarjetaLugar from '../components/TarjetaLugar.vue';

  const lugaresStore = useLugaresStore();
  const categoriaSeleccionada = ref(null);
  const modoCercania = ref(false);
  const buscandoUbicacion = ref(false);
  const errorUbicacion = ref(null);
  const lugaresCercanos = ref([]);
  const centroUsuario = ref(null);

  const categorias = [
    { valor: null, etiqueta: 'Todos' },
    { valor: 'restaurante', etiqueta: 'Restaurantes' },
    { valor: 'cafe', etiqueta: 'Cafés' },
    { valor: 'parque', etiqueta: 'Parques' },
    { valor: 'tienda', etiqueta: 'Tiendas' },
    { valor: 'otro', etiqueta: 'Otros' },
  ];

  const lugaresVisibles = computed(() => (modoCercania.value ? lugaresCercanos.value : lugaresStore.lugares));
  const centroMapa = computed(() => centroUsuario.value || [-12.0464, -77.0428]);

  const filtrar = (categoria) => {
    categoriaSeleccionada.value = categoria;
    modoCercania.value = false;
    lugaresStore.listar(categoria);
  };

  const alternarCercania = () => {
    if (modoCercania.value) {
      modoCercania.value = false;
      return;
    }
    buscarCercanos();
  };

  const buscarCercanos = () => {
    if (!navigator.geolocation) {
      errorUbicacion.value = 'Tu navegador no permite compartir ubicación.';
      return;
    }

    buscandoUbicacion.value = true;
    errorUbicacion.value = null;

    navigator.geolocation.getCurrentPosition(
      async (posicion) => {
        const { latitude, longitude } = posicion.coords;
        centroUsuario.value = [latitude, longitude];
        try {
          lugaresCercanos.value = await lugaresStore.cercanos(latitude, longitude);
          modoCercania.value = true;
        } catch {
          errorUbicacion.value = 'Error al buscar lugares cercanos.';
        } finally {
          buscandoUbicacion.value = false;
        }
      },
      () => {
        errorUbicacion.value = 'No pudimos acceder a tu ubicación. Revisa los permisos del navegador.';
        buscandoUbicacion.value = false;
      }
    );
  };

  onMounted(() => lugaresStore.listar());
  </script>