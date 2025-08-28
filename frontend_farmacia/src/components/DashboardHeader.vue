<template>
  <header class="header">
    <div class="header__left">
      <Shield class="header__icon" />
      <h1 class="header__title">Farmacia Organizada</h1>
    </div>

    <div class="header__right">
      <div class="header__user-info">
        <span class="header__email">{{ userEmail }}</span>
        <span class="header__role">{{ userRole }}</span>
      </div>

      <button class="btn btn--secondary header__logout" @click="logout()">
        <LogOut class="header__logout-icon" />
        Cerrar Sesión
      </button>
    </div>
  </header>

  <div class="content-container">
    <nav class="main-nav">
      <router-link to="/inventario" class="nav-link">
        <InventoryIcon class="nav-icon" />
        <span>Inventario</span>
      </router-link>
      <router-link to="/reportes" class="nav-link">
        <HistoryIcon class="nav-icon" />
        <span>Solicitudes</span>
      </router-link>

      <router-link v-if="userRole === 'ADMIN'" to="/movimientos" class="nav-link">
        <ArrowLeftRight class="nav-icon" />
        <span>Movimientos de stock</span>
      </router-link>

      <router-link v-if="userRole === 'ADMIN'" to="/proveedores" class="nav-link">
        <Contact class="nav-icon" />
        <span>Proveedores</span>
      </router-link>
    </nav>

    <router-view />
  </div>
</template>

<script>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { Shield, LogOut, Box as InventoryIcon, FileText as HistoryIcon, ArrowLeftRight, Contact } from 'lucide-vue-next';

export default {
  name: 'DashboardHeader',
  components: { Shield, LogOut, InventoryIcon, HistoryIcon, ArrowLeftRight, Contact },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    const userEmail = computed(() => authStore.userEmail);
    const userRole = computed(() => authStore.userRole);

    const logout = () => {
      authStore.logout();
      router.push({ name: 'Login' });
    };

    return { userEmail, userRole, logout };
  },
};
</script>
