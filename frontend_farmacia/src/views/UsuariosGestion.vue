<template>
  <div class="container">
    <DashboardHeader />
    <h1 class="page-title">Gestión de Usuarios</h1>

    <div class="actions-header">
      <button @click="abrirModalCrear" class="btn btn-primary">
        + Agregar Usuario
      </button>
    </div>

    <div v-if="loading" class="message info">Cargando usuarios...</div>
    <div v-else-if="!usuarios.length" class="message info">No se encontraron usuarios.</div>

    <div v-else class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Activo</th>
            <th>Fecha de Creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="usuario in usuarios" :key="usuario._id">
            <td>{{ usuario.nombre }}</td>
            <td>{{ usuario.correo }}</td>
            <td>{{ usuario.rol }}</td>
            <td>{{ usuario.activo ? "Sí" : "No" }}</td>
            <td>{{ formatDate(usuario.createdAt) }}</td>
            <td>
              <button class="btn btn-secondary btn-sm" @click="abrirModalEditar(usuario)">
                Editar
              </button>
              <button class="btn btn-danger btn-sm" @click="eliminarUsuario(usuario._id)">
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <Modal :show="showModal" @close="cerrarModal">
      <template #header>
        <h3>{{ isEditing ? "Editar Usuario" : "Agregar Nuevo Usuario" }}</h3>
      </template>

      <template #body>
        <form @submit.prevent="guardarUsuario" class="modal-form">
          <!-- Nombre -->
          <div class="form-group">
            <label for="nombre">Nombre *</label>
            <input type="text" id="nombre" v-model.trim="nuevoUsuario.nombre" />
            <span v-if="errores.nombre" class="error-text">{{ errores.nombre }}</span>
          </div>

          <!-- Correo -->
          <div class="form-group">
            <label for="correo">Correo *</label>
            <input type="email" id="correo" v-model.trim="nuevoUsuario.correo" />
            <span v-if="errores.correo" class="error-text">{{ errores.correo }}</span>
          </div>

          <!-- Contraseña (solo al crear) -->
          <div class="form-group" v-if="!isEditing">
            <label for="password">Contraseña *</label>
            <input type="password" id="password" v-model.trim="nuevoUsuario.password" />
            <span v-if="errores.password" class="error-text">{{ errores.password }}</span>
          </div>

          <!-- Rol -->
          <div class="form-group">
            <label for="rol">Rol *</label>
            <select id="rol" v-model="nuevoUsuario.rol">
              <option value="">-- Seleccione --</option>
              <option value="ADMIN">ADMIN</option>
              <option value="TENS">TENS</option>
            </select>
            <span v-if="errores.rol" class="error-text">{{ errores.rol }}</span>
          </div>

          <!-- Activo -->
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="nuevoUsuario.activo" /> Activo
            </label>
          </div>

          <!-- Botones -->
          <div class="modal-actions">
            <button type="submit" class="btn btn-primary" :disabled="isSaving">
              {{ isSaving ? "Guardando..." : "Guardar" }}
            </button>
            <button type="button" class="btn btn-secondary" @click="cerrarModal">
              Cancelar
            </button>
          </div>
        </form>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario as eliminarUsuarioService
} from "@/services/usuariosService.js";
import Modal from "@/components/Modal.vue";
import DashboardHeader from "@/components/DashboardHeader.vue";

const usuarios = ref([]);
const loading = ref(true);
const showModal = ref(false);
const isSaving = ref(false);
const isEditing = ref(false);
const usuarioSeleccionado = ref(null);

const nuevoUsuario = ref({
  nombre: "",
  correo: "",
  password: "",
  rol: "",
  activo: true
});

const errores = ref({});

const formatDate = (fecha) =>
  fecha ? new Date(fecha).toLocaleDateString("es-CL", { year: "numeric", month: "long", day: "numeric" }) : "N/A";

// Cargar usuarios
const cargarUsuarios = async () => {
  loading.value = true;
  try {
    const data = await listarUsuarios();
    usuarios.value = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error al cargar usuarios:", err);
    usuarios.value = [];
  } finally {
    loading.value = false;
  }
};

// Modal
const abrirModalCrear = () => {
  resetFormulario();
  showModal.value = true;
};

const abrirModalEditar = (usuario) => {
  isEditing.value = true;
  usuarioSeleccionado.value = { ...usuario };
  nuevoUsuario.value = {
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol,
    activo: usuario.activo,
    password: ""
  };
  showModal.value = true;
};

const cerrarModal = () => {
  showModal.value = false;
  resetFormulario();
  isEditing.value = false;
  usuarioSeleccionado.value = null;
};

const resetFormulario = () => {
  nuevoUsuario.value = { nombre: "", correo: "", password: "", rol: "", activo: true };
  errores.value = {};
};

// Validación simple
const validarFormulario = () => {
  errores.value = {};
  if (!nuevoUsuario.value.nombre.trim()) errores.value.nombre = "El nombre es obligatorio";
  if (!nuevoUsuario.value.correo.trim()) errores.value.correo = "El correo es obligatorio";
  else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(nuevoUsuario.value.correo))
    errores.value.correo = "Correo no válido";
  if (!isEditing.value && !nuevoUsuario.value.password.trim()) errores.value.password = "La contraseña es obligatoria";
  if (!nuevoUsuario.value.rol) errores.value.rol = "Debe seleccionar un rol";

  return Object.keys(errores.value).length === 0;
};

// Guardar usuario
const guardarUsuario = async () => {
  if (!validarFormulario()) return;

  isSaving.value = true;
  try {
    if (isEditing.value && usuarioSeleccionado.value?._id) {
      await actualizarUsuario(usuarioSeleccionado.value._id, nuevoUsuario.value);
    } else {
      await crearUsuario(nuevoUsuario.value);
    }
    await cargarUsuarios();
    cerrarModal();
  } catch (err) {
    console.error("Error al guardar usuario:", err);
    alert("Error al guardar usuario");
  } finally {
    isSaving.value = false;
  }
};

// Eliminar usuario
const eliminarUsuario = async (id) => {
  if (!confirm("¿Desea eliminar este usuario?")) return;

  try {
    await eliminarUsuarioService(id);
    await cargarUsuarios();
  } catch (err) {
    console.error("Error al eliminar usuario:", err);
    alert("Error al eliminar usuario");
  }
};

onMounted(cargarUsuarios);
</script>

<style scoped>
.actions-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
  padding-right: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.error-text {
  color: red;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
}
</style>
