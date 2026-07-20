<template>
  <div class="max-w-sm mx-auto mt-16 px-4">
    <h1 class="text-2xl font-bold text-white mb-6">Crear cuenta</h1>

    <form @submit.prevent="enviar" class="flex flex-col gap-4">
      <label class="flex flex-col gap-1.5">
        <span class="font-semibold text-gray-200">Nombre</span>
        <input
          v-model="form.nombre"
          type="text"
          required
          class="bg-card border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </label>

      <label class="flex flex-col gap-1.5">
        <span class="font-semibold text-gray-200">Email</span>
        <input
          v-model="form.email"
          type="email"
          required
          class="bg-card border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </label>

      <label class="flex flex-col gap-1.5">
        <span class="font-semibold text-gray-200">Contraseña</span>
        <input
          v-model="form.password"
          type="password"
          minlength="6"
          required
          class="bg-card border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </label>

      <button
        type="submit"
        :disabled="enviando"
        class="mt-2 px-4 py-2.5 rounded-lg font-semibold text-white bg-primary hover:bg-primary-hover disabled:bg-gray-700 disabled:text-gray-400 transition"
      >
        {{ enviando ? 'Creando cuenta...' : 'Registrarme' }}
      </button>
    </form>

    <p class="mt-5 text-center text-gray-400">
      ¿Ya tienes cuenta?
      <RouterLink to="/login" class="text-primary hover:text-primary-hover font-medium">Inicia sesión</RouterLink>
    </p>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useNotificar } from '../composables/useNotificar';

const router = useRouter();
const authStore = useAuthStore();
const { exito, error: notificarError } = useNotificar();

const form = reactive({ nombre: '', email: '', password: '' });
const enviando = ref(false);

const enviar = async () => {
  enviando.value = true;
  try {
    await authStore.registrar(form);
    exito('¡Cuenta creada correctamente!');
    router.push({ name: 'home' });
  } catch (err) {
    notificarError(err.response?.data?.mensaje || 'Error al registrarte.');
  } finally {
    enviando.value = false;
  }
};
</script>