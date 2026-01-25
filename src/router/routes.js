import { useUsuarioStore } from "src/stores/usuario";

const routes = [
  {
    path: "/",
    beforeEnter: (to, from, next) => {
      const usuarioStore = useUsuarioStore();
      usuarioStore.reidratarStore();
      if (!usuarioStore.token) {
        next({ path: "/login" });
      } else {
        next();
      }
    },
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/IndexPage.vue") },
      {
        path: "/clientes",
        component: () => import("pages/clientes/index.vue"),
      },
      {
        path: "/relatorios",
        component: () => import("pages/relatorios/index.vue"),
      },
    ],
  },

  {
    path: "/login",
    component: () => import("layouts/NoLayout.vue"),
    children: [
      { path: "/login", component: () => import("pages/auth/login.vue") },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
