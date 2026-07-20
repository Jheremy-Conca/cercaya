<template>
  <header class="nav">
    <RouterLink to="/" class="logo">CercaYa</RouterLink>
    <nav>
      <RouterLink to="/">Inicio</RouterLink>
      <RouterLink v-if="authStore.estaAutenticado" to="/lugares/crear">Agregar lugar</RouterLink>
      <RouterLink v-if="authStore.estaAutenticado" to="/perfil">Mi perfil</RouterLink>
      <RouterLink v-else to="/login">Ingresar</RouterLink>
      <button class="toggle-tema" @click="temaStore.alternar()"
        :aria-label="temaStore.modo === 'claro' ? 'Activar modo oscuro' : 'Activar modo claro'">
        {{ temaStore.modo === 'claro' ? '🌙' : '☀️' }}
      </button>
    </nav>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import { useTemaStore } from './stores/tema';

const authStore = useAuthStore();
const temaStore = useTemaStore();

onMounted(() => temaStore.aplicar());
</script>

<style scoped>
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background);
}

.logo {
  font-weight: 700;
  font-size: 1.2rem;
  text-decoration: none;
  color: var(--color-heading);
}

nav {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

nav a {
  color: var(--color-text);
}

.toggle-tema {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 3rem;
}
</style>