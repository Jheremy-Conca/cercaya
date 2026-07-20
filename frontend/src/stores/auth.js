import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    usuario: JSON.parse(localStorage.getItem('usuario')) || null,
    token: localStorage.getItem('token') || null,
  }),

  getters: {
    estaAutenticado: (state) => !!state.token,
  },

  actions: {
    async registrar({ nombre, email, password }) {
      const { data } = await api.post('/auth/registro', { nombre, email, password });
      this._guardarSesion(data.usuario, data.token);
      return data;
    },

    async login({ email, password }) {
      const { data } = await api.post('/auth/login', { email, password });
      this._guardarSesion(data.usuario, data.token);
      return data;
    },

    async olvidarPassword(email) {
      const { data } = await api.post('/auth/olvide-password', { email });
      return data;
    },

    async restablecerPassword(token, password) {
      const { data } = await api.put(`/auth/restablecer-password/${token}`, { password });
      return data;
    },

    logout() {
      this.usuario = null;
      this.token = null;
      localStorage.removeItem('usuario');
      localStorage.removeItem('token');
    },

    _guardarSesion(usuario, token) {
      this.usuario = usuario;
      this.token = token;
      localStorage.setItem('usuario', JSON.stringify(usuario));
      localStorage.setItem('token', token);
    },
  },
});