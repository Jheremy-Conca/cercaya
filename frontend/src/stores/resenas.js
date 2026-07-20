import { defineStore } from "pinia";
import api from "../services/api";

export const useResenasStore = defineStore("resenas", {
  state: () => ({
    resenas: [],
    misResenas: [], // 👈 agrega esta línea
    cargando: false,
    error: null,
  }),

  actions: {
    async listarPorLugar(lugarId) {
      this.cargando = true;
      this.error = null;
      try {
        const { data } = await api.get(`/resenas/lugar/${lugarId}`);
        this.resenas = data.resenas;
        return data.resenas;
      } catch (err) {
        this.error =
          err.response?.data?.mensaje || "Error al cargar las reseñas.";
        throw err;
      } finally {
        this.cargando = false;
      }
    },

    async crear(lugarId, payload) {
      if (payload instanceof FormData) {
        payload.append("lugar_id", lugarId);
      } else {
        payload = { ...payload, lugar_id: lugarId };
      }
      const { data } = await api.post("/resenas", payload);
      this.resenas.unshift(data.resena);
      return data.resena;
    },

    async editar(id, payload) {
      const { data } = await api.put(`/resenas/${id}`, payload);
      const index = this.resenas.findIndex((r) => r.id === id);
      if (index !== -1) this.resenas[index] = data.resena;
      return data.resena;
    },

    async eliminar(id) {
      await api.delete(`/resenas/${id}`);
      this.resenas = this.resenas.filter((r) => r.id !== id);
    },
    async obtenerMias() {
      this.cargando = true;
      this.error = null;
      try {
        const { data } = await api.get("/resenas/mias");
        this.misResenas = data.resenas ?? [];
        return this.misResenas;
      } catch (err) {
        this.error =
          err.response?.data?.mensaje || "Error al cargar tus reseñas.";
        this.misResenas = []; // 👈 evita que quede undefined
        throw err;
      } finally {
        this.cargando = false;
      }
    },
  },
});
