<template>
  <div class="max-w-sm mx-auto mt-16 px-4">
    <h1 class="text-2xl font-bold text-[var(--color-heading)] mb-2">Recuperar contraseña</h1>
    <p class="text-[var(--color-text)] opacity-70 mb-6">
      Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
    </p>

    <form v-if="!enviado" @submit.prevent="enviar" class="flex flex-col gap-4">
      <label class="flex flex-col gap-1.5">
        <span class="font-semibold text-[var(--color-heading)]">Email</span>
        <input
          v-model="email"
          type="email"
          required
          class="bg-[var(--color-background-soft)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </label>

      <button
        type="submit"
        :disabled="enviando"
        class="mt-2 px-4 py-2.5 rounded-lg font-semibold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 transition"
      >
        {{ enviando ? 'Enviando...' : 'Enviar enlace' }}
      </button>
    </form>

    <p v-else class="text-[var(--color-text)]">
      Si el correo está registrado, te llegará un enlace en unos minutos. Revisa también tu carpeta de spam.
    </p>

    <p class="mt-5 text-center text-[var(--color-text)] opacity-70">
      <RouterLink to="/login" class="text-primary hover:text-primary-hover font-medium">
        Volver a iniciar sesión
      </RouterLink>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useNotificar } from '../composables/useNotificar';

const authStore = useAuthStore();
const { error: notificarError } = useNotificar();

const email = ref('');
const enviando = ref(false);
const enviado = ref(false);

const enviar = async () => {
  enviando.value = true;
  try {
    await authStore.olvidarPassword(email.value);
    enviado.value = true;
  } catch (err) {
    notificarError(err.response?.data?.mensaje || 'Error al enviar el enlace.');
  } finally {
    enviando.value = false;
  }
};
</script>