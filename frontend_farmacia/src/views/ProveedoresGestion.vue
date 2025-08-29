<template>
  <div class="container">
    <!-- Encabezado -->
    <DashboardHeader />

    <!-- Título -->
    <h1 class="page-title">Gestión de Proveedores</h1>

    <!-- Acciones -->
    <div class="actions-header">
      <button @click="abrirModalCrear" class="btn btn-primary">
        + Agregar Proveedor
      </button>
    </div>

    <!-- Estado: cargando -->
    <div v-if="loading" class="message info">
      Cargando proveedores...
    </div>

    <!-- Estado: sin resultados -->
    <div v-else-if="!proveedores.length" class="message info">
      No se encontraron proveedores.
    </div>

    <!-- Tabla de resultados -->
    <div v-else class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Correo</th>
            <th>Dirección</th>
            <th>Fecha de Creación</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="proveedor in proveedores" :key="proveedor._id">
            <td>{{ proveedor.nombre }}</td>
            <td>{{ proveedor.telefono || "N/A" }}</td>
            <td>{{ proveedor.email || "N/A" }}</td>
            <td>{{ proveedor.direccion || "N/A" }}</td>
            <td>{{ formatDate(proveedor.createdAt) }}</td>
          <td>
      <button class="btn btn-secondary btn-sm" @click="abrirModalEditar(proveedor)">
        Editar
      </button>
    </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para crear proveedor -->
    <Modal :show="showModal" @close="cerrarModal">
      <template #header>
        <h3>Agregar Nuevo Proveedor</h3>
      </template>

      <template #body>
        <form @submit.prevent="guardarProveedor" class="modal-form">
          <!-- Nombre -->
          <div class="form-group">
            <label for="nombre">Nombre *</label>
            <input
              type="text"
              id="nombre"
              v-model.trim="nuevoProveedor.nombre"
              required
            />
          </div>

          <!-- Teléfono -->
          <div class="form-group">
            <label for="telefono">Teléfono</label>
            <input type="tel" id="telefono" v-model.trim="nuevoProveedor.telefono" />
          </div>

          <!-- Email -->
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model.trim="nuevoProveedor.email" />
          </div>

          <!-- Dirección -->
          <div class="form-group">
            <label for="direccion">Dirección</label>
            <input type="text" id="direccion" v-model.trim="nuevoProveedor.direccion" />
          </div>

          <!-- Acciones del modal -->
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
/**
 * Gestión de Proveedores
 * - Lista proveedores desde la API
 * - Permite agregar/editar proveedores vía modal
 * - Maneja estados de carga, vacío y errores
 */

import { ref, onMounted } from "vue";
import { listarProveedores, crearProveedor, actualizarProveedor} from "@/services/proveedoresService";
import Modal from "@/components/Modal.vue";
import DashboardHeader from "@/components/DashboardHeader.vue";

const proveedores = ref([]); // Lista de proveedores
const loading = ref(true);   // Estado de carga
const showModal = ref(false); // Control de modal
const isSaving = ref(false);  // Estado de guardado
const isEditing = ref(false);        // Indica si estamos editando
const proveedorSeleccionado = ref(null); // Guarda el proveedor a editar



// Modelo para formulario
const nuevoProveedor = ref({
  nombre: "",
  telefono: "",
  email: "",
  direccion: "",
});

//Formatea una fecha a formato legible (Chile)
const formatDate = (fecha) =>
  fecha
    ? new Date(fecha).toLocaleDateString("es-CL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

//Carga proveedores desde API
const cargarProveedores = async () => {
  loading.value = true;
  try {
    const data = await listarProveedores();
    proveedores.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error al cargar proveedores:", error);
    proveedores.value = [];
  } finally {
    loading.value = false;
  }
};

//Manejo del modal
const abrirModalCrear = () => (showModal.value = true);

const resetFormulario = () => {
  nuevoProveedor.value = { nombre: "", telefono: "", email: "", direccion: "" };
};

//Guardar nuevo proveedor
const guardarProveedor = async () => {
  if (!nuevoProveedor.value.nombre.trim()) {
    alert("El nombre es obligatorio.");
    return;
  }

  isSaving.value = true;
   try {
    if (isEditing.value && proveedorSeleccionado.value?._id) {
      // Actualizar proveedor existente
      await actualizarProveedor(proveedorSeleccionado.value._id, nuevoProveedor.value);
    } else {
      // Crear nuevo proveedor
      await crearProveedor(nuevoProveedor.value);
    }

    await cargarProveedores();
    cerrarModal();
  } catch (error) {
    console.error("Error al guardar proveedor:", error);
    alert("Error al guardar el proveedor.");
  } finally {
    isSaving.value = false;
  }
};

const abrirModalEditar = (proveedor) => {
  isEditing.value = true;
  proveedorSeleccionado.value = { ...proveedor }; // Clonamos para no modificar directamente
  nuevoProveedor.value = { 
    nombre: proveedor.nombre,
    telefono: proveedor.telefono || "",
    email: proveedor.email || "",
    direccion: proveedor.direccion || ""
  };
  showModal.value = true;
};

const cerrarModal = () => {
  showModal.value = false;
  resetFormulario();
  isEditing.value = false;
  proveedorSeleccionado.value = null;
};


// Cargar proveedores al montar componente
onMounted(cargarProveedores);

</script>

<style scoped>
.actions-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
  padding-right: 1rem
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}
</style>
