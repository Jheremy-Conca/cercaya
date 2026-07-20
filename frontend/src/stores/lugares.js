import { defineStore } from 'pinia';
import api from '../services/api';

export const useLugaresStore = defineStore('lugares', {
  state: () => ({
    lugares: [],
    lugarActual: null,
    cargando: false,
    error: null,
  }),

  actions: {
    async listar(categoria = null) {
      this.cargando = true;
      this.error = null;
      try {
        const params = categoria ? { categoria } : {};
        const { data } = await api.get('/lugares', { params });
        this.lugares = data.lugares;
      } catch (err) {
        this.error = err.response?.data?.mensaje || 'Error al cargar los lugares.';
      } finally {
        this.cargando = false;
      }
    },

    async obtenerPorId(id) {
      this.cargando = true;
      this.error = null;
      try {
        const { data } = await api.get(`/lugares/${id}`);
        this.lugarActual = data.lugar;
        return data.lugar;
      } catch (err) {
        this.error = err.response?.data?.mensaje || 'Error al cargar el lugar.';
        throw err;
      } finally {
        this.cargando = false;
      }
    },

    async crear(payload) {
      const { data } = await api.post('/lugares', payload);
      this.lugares.unshift(data.lugar);
      return data.lugar;
    },

    async editar(id, payload) {
      const { data } = await api.put(`/lugares/${id}`, payload);
      const index = this.lugares.findIndex((l) => l.id === id);
      if (index !== -1) this.lugares[index] = data.lugar;
      if (this.lugarActual?.id === id) this.lugarActual = data.lugar;
      return data.lugar;
    },

    async eliminar(id) {
      await api.delete(`/lugares/${id}`);
      this.lugares = this.lugares.filter((l) => l.id !== id);
    },

    async cercanos(lat, lng, radioKm = 5) {
      const { data } = await api.get('/lugares/cercanos', {
        params: { lat, lng, radio: radioKm },
      });
      return data.lugares;
    },
  },
});