<template>
  <div class="perfil" v-if="authStore.usuario">
    <div class="max-w-5xl mx-auto px-4 py-8">
      <div class="flex items-center justify-between flex-wrap gap-4 mb-10">
        <div>
          <h1 class="text-3xl font-bold text-[var(--color-heading)]">{{ authStore.usuario.nombre }}</h1>
          <p class="text-[var(--color-text)] opacity-70">{{ authStore.usuario.email }}</p>
        </div>
        <button
          @click="cerrarSesion"
          class="px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-background-mute)] hover:border-[var(--color-border-hover)] transition"
        >
          Cerrar sesión
        </button>
      </div>

      <section class="mb-12">
        <h2 class="text-xl font-semibold text-[var(--color-heading)] mb-4 border-b border-[var(--color-border)] pb-2">
          Mis lugares
        </h2>

        <div v-if="misLugares.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="lugar in misLugares"
            :key="lugar.id"
            class="bg-[var(--color-background-soft)] rounded-xl p-4 shadow-md hover:shadow-lg transition flex flex-col gap-3"
          >
            <TarjetaLugar :lugar="lugar" />
            <div class="flex gap-3 pt-2 border-t border-[var(--color-border)]">
              <RouterLink
                :to="{ name: 'editar-lugar', params: { id: lugar.id } }"
                class="text-primary hover:text-primary-hover font-medium text-sm"
              >
                Editar
              </RouterLink>
              <button
                class="text-red-500 hover:text-red-400 font-medium text-sm ml-auto"
                @click="lugarAEliminar = lugar"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
        <p v-else class="text-[var(--color-text)] opacity-60 italic">Todavía no has agregado ningún lugar.</p>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-[var(--color-heading)] mb-4 border-b border-[var(--color-border)] pb-2">
          Mis reseñas
        </h2>

        <div v-if="resenasStore.misResenas?.length" class="flex flex-col divide-y divide-[var(--color-border)]">
          <article
            v-for="resena in resenasStore.misResenas"
            :key="resena.id"
            class="py-5 flex flex-col gap-2"
          >
            <header class="flex items-center gap-3">
              <strong class="text-[var(--color-heading)]">{{ resena.lugar?.nombre || 'Lugar' }}</strong>
              <EstrellasRating :model-value="resena.rating" readonly />
            </header>
            <p class="text-[var(--color-text)]">{{ resena.comentario }}</p>
            <div class="flex gap-3 mt-1">
              <button
                class="px-3 py-1 rounded-md border border-[var(--color-border)] text-[var(--color-text)] text-sm hover:bg-[var(--color-background-mute)]"
                @click="resenaEditando = resena"
              >
                Editar
              </button>
              <button
                class="px-3 py-1 rounded-md border border-red-600 text-red-500 text-sm hover:bg-red-950/20"
                @click="resenaAEliminar = resena"
              >
                Eliminar
              </button>
            </div>
          </article>
        </div>
        <p v-else class="text-[var(--color-text)] opacity-60 italic">Todavía no has escrito ninguna reseña.</p>
      </section>
    </div>

    <ModalBase v-if="resenaEditando" @cerrar="resenaEditando = null">
      <FormResena
        :lugar-id="resenaEditando.lugar_id"
        :resena="resenaEditando"
        @guardado="alEditarResena"
        @cerrar="resenaEditando = null"
      />
    </ModalBase>

    <ModalConfirmar
      v-if="lugarAEliminar"
      titulo="Eliminar lugar"
      :mensaje="`¿Seguro que quieres eliminar &quot;${lugarAEliminar.nombre}&quot;? Esta acción no se puede deshacer.`"
      :al-confirmar="() => eliminarLugar(lugarAEliminar.id)"
      @confirmado="lugarAEliminar = null"
      @cancelar="lugarAEliminar = null"
    />

    <ModalConfirmar
      v-if="resenaAEliminar"
      titulo="Eliminar reseña"
      mensaje="¿Seguro que quieres eliminar esta reseña? Esta acción no se puede deshacer."
      :al-confirmar="() => eliminarResena(resenaAEliminar.id)"
      @confirmado="resenaAEliminar = null"
      @cancelar="resenaAEliminar = null"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useLugaresStore } from '../stores/lugares';
import { useResenasStore } from '../stores/resenas';
import { useNotificar } from '../composables/useNotificar';
import TarjetaLugar from '../components/TarjetaLugar.vue';
import EstrellasRating from '../components/EstrellasRating.vue';
import ModalBase from '../components/ModalBase.vue';
import ModalConfirmar from '../components/ModalConfirmar.vue';
import FormResena from '../components/FormResena.vue';

const authStore = useAuthStore();
const lugaresStore = useLugaresStore();
const resenasStore = useResenasStore();
const router = useRouter();
const { exito, error: notificarError } = useNotificar();

const lugarAEliminar = ref(null);
const resenaAEliminar = ref(null);
const resenaEditando = ref(null);

const misLugares = computed(() =>
  lugaresStore.lugares.filter((l) => l.creado_por === authStore.usuario?.id)
);

const cerrarSesion = () => {
  authStore.logout();
  router.push({ name: 'home' });
};

const alEditarResena = () => {
  resenaEditando.value = null;
  resenasStore.obtenerMias();
  exito('Reseña actualizada correctamente.');
};

const eliminarLugar = async (id) => {
  try {
    await lugaresStore.eliminar(id);
    exito('Lugar eliminado correctamente.');
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

onMounted(() => {
  if (!lugaresStore.lugares.length) lugaresStore.listar();
  resenasStore.obtenerMias();
});
</script>