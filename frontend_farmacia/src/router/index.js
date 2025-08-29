// src/router/index.js
// =======================
// Configuración de rutas y protección global
// =======================

import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// Vistas
import Login from '../views/Login.vue';
import Inventario from '../views/Inventario.vue';
import ReportesHistorial from '../views/ReportesHistorial.vue';
import MovimientosHistorial from '@/views/MovimientosHistorial.vue';
import ProveedoresGestion from '@/views/ProveedoresGestion.vue';
import UsuariosGestion from '../views/UsuariosGestion.vue';
// =======================
// Definición de rutas
// =======================
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  {
    path: '/inventario',
    name: 'Inventario',
    component: Inventario,
    meta: { requiresAuth: true }
  },
  {
    path: '/reportes',
    name: 'Reportes',
    component: ReportesHistorial,
    meta: { requiresAuth: true }
  },
  {
    path: '/movimientos',
    name: 'Movimientos',
    component: MovimientosHistorial,
    meta: { requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: '/proveedores',
    name: 'GestionProveedores',
    component: ProveedoresGestion,
    meta: { requiresAuth: true, roles: ['ADMIN'] }
  },

  {
    path: '/usuarios',
    name: 'GestionUsuarios',
    component: UsuariosGestion,
    meta: { requiresAuth: true, roles: ['ADMIN'] } // solo admins
  }
];

// =======================
// Crear router
// =======================
const router = createRouter({
  history: createWebHistory(),
  routes
});

// =======================
// Protección global de rutas
// =======================
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  //  Redirigir a login si la ruta requiere autenticación
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login');
  }

  // Validar roles si la ruta tiene restricción
  if (to.meta.roles?.length && !to.meta.roles.includes(authStore.userRole)) {
    // Usuario no autorizado → redirigir a Inventario
    return next('/inventario');
  }

  // Permitir acceso
  next();
});

export default router;
