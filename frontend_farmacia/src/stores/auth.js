// ================================================================
// Store de autenticación usando Pinia
// Gestiona usuario, token y estado de sesión
// ================================================================

import { defineStore } from 'pinia';
import { clearUserSession, getCurrentUser, getToken, setUserSession } from '@/utils/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    /** Usuario actualmente logeado, recuperado desde localStorage */
    user: getCurrentUser(),
    /** Token JWT del usuario */
    token: getToken(),
  }),
  getters: {
    /** Correo del usuario logeado */
    userEmail: (state) => state.user?.correo || '',
    /** Rol del usuario logeado */
    userRole: (state) => state.user?.rol || '',
    /** Indica si el usuario está autenticado */
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    /**
     * Guarda usuario y token en el store y en localStorage
     * @param {object} user - Datos del usuario
     * @param {string} token - Token JWT
     */
    setUser(user, token) {
      this.user = user;
      this.token = token;
      setUserSession(token, user);
    },
    /**
     * Cierra la sesión del usuario
     * Elimina datos del store y de localStorage
     */
    logout() {
      this.user = null;
      this.token = null;
      clearUserSession();
    },
  },
});
