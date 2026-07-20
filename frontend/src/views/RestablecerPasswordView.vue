<template>
  <div class="max-w-sm mx-auto mt-16 px-4">
    <h1 class="text-2xl font-bold text-[var(--color-heading)] mb-6">Restablecer contraseña</h1>

    <form v-if="!listo" @submit.prevent="enviar" class="flex flex-col gap-4">
      <label class="flex flex-col gap-1.5">
        <span class="font-semibold text-[var(--color-heading)]">Nueva contraseña</span>
        <input
          v-model="password"
          type="password"
          minlength="6"
          required
          class="bg-[var(--color-background-soft)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </label>

      <label class="flex flex-col gap-1.5">
        <span class="font-semibold text-[var(--color-heading)]">Confirmar contraseña</span>
        <input
          v-model="confirmacion"
          type="password"
          minlength="6"
          required
          class="bg-[var(--color-background-soft)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </label>

      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

      <button
        type="submit"
        :disabled="enviando"
        class="mt-2 px-4 py-2.5 rounded-lg font-semibold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 transition"
      >
        {{ enviando ? 'Guardando...' : 'Restablecer contraseña' }}
      </button>
    </form>

    <div v-else class="flex flex-col gap-4">
      <p class="text-[var(--color-text)]">Tu contraseña fue actualizada correctamente.</p>
      <RouterLink
        to="/login"
        class="text-center px-4 py-2.5 rounded-lg font-semibold text-white bg-primary hover:bg-primary-hover transition"
      >
        Iniciar sesión
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useNotificar } from '../composables/useNotificar';

const props = defineProps({
  token: { type: String, required: true },
});

const authStore = useAuthStore();
const { exito, error: notificarError } = useNotificar();

const password = ref('');
const confirmacion = ref('');
const enviando = ref(false);
const listo = ref(false);
const error = ref(null);

const enviar = async () => {
  error.value = null;

  if (password.value !== confirmacion.value) {
    error.value = 'Las contraseñas no coinciden.';
    return;
  }

  enviando.value = true;
  try {
    await authStore.restablecerPassword(props.token, password.value);
    exito('Contraseña actualizada correctamente.');
    listo.value = true;
  } catch (err) {
    notificarError(err.response?.data?.mensaje || 'El enlace es inválido o ya expiró.');
  } finally {
    enviando.value = false;
  }
};
</script>