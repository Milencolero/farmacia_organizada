// ================================================================
// Configuración de Axios para la API del sistema
// Incluye baseURL y manejo automático de token JWT
// ================================================================

import axios from "axios";

// Crear instancia de Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: agrega automáticamente el token de autorización si existe
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
