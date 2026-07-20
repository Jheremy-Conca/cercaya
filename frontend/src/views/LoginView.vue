<template>
  <div class="max-w-sm mx-auto mt-16 px-4">
    <h1 class="text-2xl font-bold text-[var(--color-heading)] mb-6">Iniciar sesión</h1>

    <form @submit.prevent="enviar" class="flex flex-col gap-4">
      <label class="flex flex-col gap-1.5">
        <span class="font-semibold text-[var(--color-heading)]">Email</span>
        <input v-model="form.email" type="email" required
          class="bg-[var(--color-background-soft)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-primary" />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="font-semibold text-[var(--color-heading)]">Contraseña</span>
        <input v-model="form.password" type="password" required
          class="bg-[var(--color-background-soft)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-primary" />
        <RouterLink to="/olvide-password" class="text-sm text-primary hover:text-primary-hover self-end mt-1">
          ¿Olvidaste tu contraseña?
        </RouterLink>
      </label>

      <button type="submit" :disabled="enviando"
        class="mt-2 px-4 py-2.5 rounded-lg font-semibold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 transition">
        {{ enviando ? 'Ingresando...' : 'Ingresar' }}
      </button>
    </form>

    <p class="mt-5 text-center text-[var(--color-text)] opacity-70">
      ¿No tienes cuenta?
      <RouterLink to="/registro" class="text-primary hover:text-primary-hover font-medium">Regístrate</RouterLink>
    </p>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useNotificar } from '../composables/useNotificar';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { exito, error: notificarError } = useNotificar();

const form = reactive({ email: '', password: '' });
const enviando = ref(false);

const enviar = async () => {
  enviando.value = true;
  try {
    await authStore.login(form);
    exito('¡Bienvenido de nuevo!');
    router.push(route.query.redirect || { name: 'home' });
  } catch (err) {
    notificarError(err.response?.data?.mensaje || 'Credenciales inválidas.');
  } finally {
    enviando.value = false;
  }
};
</script>