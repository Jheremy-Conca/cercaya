import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import RegistroView from "../views/RegistroView.vue";
import LugarDetalleView from "../views/LugarDetalleView.vue";
import PerfilView from "../views/PerfilView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
      meta: { soloInvitado: true },
    },
    {
      path: "/registro",
      name: "registro",
      component: RegistroView,
      meta: { soloInvitado: true },
    },
    {
      path: "/lugares/:id",
      name: "lugar-detalle",
      component: LugarDetalleView,
      props: true, // pasa el :id como prop al componente
    },
    {
      path: "/perfil",
      name: "perfil",
      component: PerfilView,
      meta: { requiereAuth: true },
    },
    {
      path: "/lugares/crear",
      name: "crear-lugar",
      component: () => import("../views/CrearLugarView.vue"),
      meta: { requiereAuth: true },
    },
    {
      path: "/lugares/:id/editar",
      name: "editar-lugar",
      component: () => import("../views/CrearLugarView.vue"),
      props: true,
      meta: { requiereAuth: true },
    },
    {
      path: "/olvide-password",
      name: "olvide-password",
      component: () => import("../views/OlvidePasswordView.vue"),
      meta: { soloInvitado: true },
    },
    {
      path: "/restablecer-password/:token",
      name: "restablecer-password",
      component: () => import("../views/RestablecerPasswordView.vue"),
      props: true,
      meta: { soloInvitado: true },
    },
  ],
});

// Guard global: bloquea rutas con meta.requiereAuth si no hay sesión
// Guard global: bloquea rutas con meta.requiereAuth si no hay sesión,
// y evita que un usuario ya logueado vea login/registro
router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (to.meta.requiereAuth && !authStore.estaAutenticado) {
    return { name: "login", query: { redirect: to.fullPath } };
  }

  if (to.meta.soloInvitado && authStore.estaAutenticado) {
    return { name: "perfil" };
  }
});

export default router;
