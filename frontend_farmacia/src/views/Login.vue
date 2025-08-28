<template>
  <div class="login-page">
    <div class="login-card">
      <!-- Header con ícono y título -->
      <div class="login-header">
        <div class="icon-wrapper">
           <Shield class="icon-shield" />
        </div>
        <h2 class="title">Farmacia Organizada</h2>
        <p class="subtitle">Gestión de Medicamentos CESFAM</p>
      </div>

      <!-- Formulario de login -->
      <form @submit.prevent="iniciarSesion" class="login-form">
        <!-- Campo correo -->
        <div class="form-group">
          <label for="correo">Correo Electrónico</label>
          <input
            id="correo"
            v-model.trim="correo"
            type="email"
            placeholder="usuario@cesfam.com"
            required
          />
        </div>

        <!-- Campo contraseña -->
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            minlength="6"
            required
          />
        </div>

        <!-- Mensaje de error dinámico -->
        <p v-if="mensajeError" class="error-text">{{ mensajeError }}</p>

        <!-- Botón de acción -->
        <button type="submit" class="btn-primary" :disabled="isLoading">
          {{ isLoading ? "Iniciando sesión..." : "Iniciar Sesión" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import api from "@/services/api.js";
import { useAuthStore } from "@/stores/auth";
import { Shield } from "lucide-vue-next";

export default {
  components: { Shield },
  name: "Login",
  data() {
    return {
      correo: "",         
      password: "",       
      mensajeError: null, // Mensaje de error visible en UI
      isLoading: false    // Estado de carga del formulario
    };
  },
  methods: {
  
    async iniciarSesion() {
      this.mensajeError = null;
      this.isLoading = true;

      try {
        // Validación básica en frontend
        if (!this.correo || !this.password) {
          this.mensajeError = "Debe ingresar correo y contraseña.";
          return;
        }

        const res = await api.post("/auth/login", {
          correo: this.correo,
          password: this.password
        });

        const { token, user } = res.data;
        const authStore = useAuthStore();

        // Guardar datos de sesión
        authStore.setUser(user, token);

        // Redirigir
        this.$router.push("/inventario");
      } catch (err) {
        console.error("Error de login:", err);
        this.mensajeError = err.response?.data?.error || "Error al iniciar sesión.";
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--muted);
  padding: 1rem;
}

.login-card {
  background: white;
  border-radius: var(--radius);
  max-width: 400px;
  width: 100%;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.login-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.icon-shield {
  width: 48px;
  height: 48px;
  color: var(--primary);
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
}

.subtitle {
  color: var(--muted-foreground);
  font-size: 0.9rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.3rem;
}

.form-group input {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border-radius: var(--radius);
  border: 1px solid #ccc;
  background: var(--input-bg);
  font-size: 0.95rem;
}

.error-text {
  color: var(--destructive);
  font-size: 0.85rem;
}

.btn-primary {
  background: var(--primary);
  color: var(--primary-foreground);
  padding: 0.7rem;
  border: none;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-primary:hover:not(:disabled) {
  background: #020111;
}
</style>
