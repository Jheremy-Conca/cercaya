<template>
  <div v-if="lugaresStore.lugarActual" class="max-w-4xl mx-auto px-4 py-8">
    <div class="flex justify-between items-start flex-wrap gap-4 mb-2">
      <div>
        <h1 class="text-3xl font-bold text-white">{{ lugaresStore.lugarActual.nombre }}</h1>
        <span class="inline-block text-xs uppercase tracking-wide text-gray-400 mt-1">
          {{ lugaresStore.lugarActual.categoria }}
        </span>
      </div>
      <div v-if="esCreador" class="flex gap-3 items-center">
        <RouterLink
          :to="{ name: 'editar-lugar', params: { id } }"
          class="text-primary hover:text-primary-hover font-medium text-sm"
        >
          Editar lugar
        </RouterLink>
        <button
          class="px-3 py-1 rounded-md border border-red-600 text-red-500 text-sm hover:bg-red-950"
          @click="mostrarConfirmarLugar = true"
        >
          Eliminar lugar
        </button>
      </div>
    </div>

    <p class="text-gray-400 mb-1">{{ lugaresStore.lugarActual.direccion }}</p>
    <p class="text-gray-300 mb-6">{{ lugaresStore.lugarActual.descripcion }}</p>

    <div class="rounded-xl overflow-hidden border border-gray-800 mb-6">
      <MapaLugares :lugares="[lugaresStore.lugarActual]" :centro="centroMapa" :zoom="15" />
    </div>

    <div class="mb-8">
      <button
        v-if="authStore.estaAutenticado"
        @click="abrirNuevaResena"
        class="px-4 py-2 rounded-lg font-semibold text-white bg-primary hover:bg-primary-hover transition"
      >
        Escribir reseña
      </button>
      <RouterLink
        v-else
        :to="{ name: 'login', query: { redirect: $route.fullPath } }"
        class="text-primary hover:text-primary-hover font-medium"
      >
        Inicia sesión para dejar una reseña
      </RouterLink>
    </div>

    <h2 class="text-xl font-semibold text-white mb-4 border-b border-gray-800 pb-2">Reseñas</h2>
    <ListaResenas
      :resenas="resenasStore.resenas"
      :usuario-actual-id="authStore.usuario?.id"
      @editar="abrirEdicionResena"
      @eliminar="(resena) => (resenaAEliminar = resena)"
    />

    <ModalBase v-if="mostrarModalResena" @cerrar="cerrarModalResena">
      <FormResena
        :lugar-id="id"
        :resena="resenaEditando"
        @guardado="alGuardarResena"
        @cerrar="cerrarModalResena"
      />
    </ModalBase>

    <ModalConfirmar
      v-if="mostrarConfirmarLugar"
      titulo="Eliminar lugar"
      mensaje="¿Seguro que quieres eliminar este lugar? Esta acción no se puede deshacer."
      :al-confirmar="eliminarLugar"
      @confirmado="mostrarConfirmarLugar = false"
      @cancelar="mostrarConfirmarLugar = false"
    />

    <ModalConfirmar
      v-if="resenaAEliminar"
      titulo="Eliminar reseña"
      mensaje="¿Seguro que quieres eliminar tu reseña? Esta acción no se puede deshacer."
      :al-confirmar="() => eliminarResena(resenaAEliminar.id)"
      @confirmado="resenaAEliminar = null"
      @cancelar="resenaAEliminar = null"
    />
  </div>

  <p v-else-if="lugaresStore.cargando" class="text-center text-gray-400 mt-16">Cargando...</p>
  <p v-else-if="lugaresStore.error" class="text-center text-red-500 mt-16">{{ lugaresStore.error }}</p>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useLugaresStore } from '../stores/lugares';
import { useResenasStore } from '../stores/resenas';
import { useAuthStore } from '../stores/auth';
import { useNotificar } from '../composables/useNotificar';
import MapaLugares from '../components/MapaLugares.vue';
import ListaResenas from '../components/ListaResenas.vue';
import FormResena from '../components/FormResena.vue';
import ModalBase from '../components/ModalBase.vue';
import ModalConfirmar from '../components/ModalConfirmar.vue';

const props = defineProps({
  id: { type: [String, Number], required: true },
});

const router = useRouter();
const lugaresStore = useLugaresStore();
const resenasStore = useResenasStore();
const authStore = useAuthStore();
const { exito, error: notificarError } = useNotificar();

const mostrarModalResena = ref(false);
const resenaEditando = ref(null);
const resenaAEliminar = ref(null);
const mostrarConfirmarLugar = ref(false);

const esCreador = computed(
  () => lugaresStore.lugarActual?.creado_por === authStore.usuario?.id
);

const centroMapa = computed(() =>
  lugaresStore.lugarActual
    ? [lugaresStore.lugarActual.latitud, lugaresStore.lugarActual.longitud]
    : [-12.0464, -77.0428]
);

const abrirNuevaResena = () => {
  resenaEditando.value = null;
  mostrarModalResena.value = true;
};

const abrirEdicionResena = (resena) => {
  resenaEditando.value = resena;
  mostrarModalResena.value = true;
};

const cerrarModalResena = () => {
  mostrarModalResena.value = false;
  resenaEditando.value = null;
};

const alGuardarResena = () => {
  cerrarModalResena();
  resenasStore.listarPorLugar(props.id);
  exito('Reseña guardada correctamente.');
};

const eliminarLugar = async () => {
  try {
    await lugaresStore.eliminar(props.id);
    exito('Lugar eliminado correctamente.');
    router.push({ name: 'home' });
  } catch (err) {
    notificarError(err.response?.data?.mensaje || 'Error al eliminar el lugar.');
  }
};

const eliminarResena = async (id) => {
  try {
    await resenasStore.eliminar(id);
    exito('Reseña eliminada correctamente.');
  } catch (err) {
    notificarError(err.response?.data?.mensaje || 'Error al eliminar la reseña.');
  }
};

onMounted(async () => {
  await lugaresStore.obtenerPorId(props.id);
  resenasStore.listarPorLugar(props.id);
});
</script>