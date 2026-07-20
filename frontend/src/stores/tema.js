import { defineStore } from "pinia";

export const useTemaStore = defineStore("tema", {
  state: () => ({
    modo: localStorage.getItem("tema") || "oscuro",
  }),

  actions: {
    alternar() {
      this.modo = this.modo === "claro" ? "oscuro" : "claro";
      this.aplicar();
    },

    aplicar() {
      document.documentElement.setAttribute("data-theme", this.modo);
      localStorage.setItem("tema", this.modo);
    },
  },
});
