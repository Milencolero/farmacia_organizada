<template>
  <div class="card min-h-screen p-6 md:p-10">
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header del dashboard -->
      <DashboardHeader />

      <!-- Alertas de medicamentos por vencer -->
      <AlertasVencimiento />

      <!-- Título sección medicamentos -->
      <div class="reportes-content space-y-4">
        <h1 class="reportes-title text-2xl font-semibold">Lista de medicamentos</h1>
      </div>

      <!-- Controles de búsqueda y acciones -->
      <InventarioControls
        v-model="searchTerm"
        :user-role="userRole"
        @request-meds="abrirModal('solicitar')"
        @add-med="abrirModal('agregar')"
        class="mb-4"
      />

      <!-- Tabla de inventario -->
      <TablaInventario
        :medications="filteredMedications"
        :userRole="userRole"
        @abrir-editar="abrirModal('editar', $event)"
      />
    </div>

    <!-- ===== Modales ===== -->
    <SolicitarMedicamentoModal
      :show="modales.solicitar"
      @close="cerrarModal('solicitar')"
    />

    <EditarMedicamentoModal
      :show="modales.editar"
      :medicamento="medEditar"
        :usuario-id="authStore.user?._id"

      @close="cerrarModal('editar')"
      @updated="actualizarMedicamentoEnLista"
    />

    <AgregarMedicamentoModal
      :show="modales.agregar"
      :proveedores="proveedores"
      @close="cerrarModal('agregar')"
      @added="agregarMedicamento"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { listarMedicamentos, crearMedicamento } from "@/services/inventarioService";
import { listarProveedores } from "@/services/proveedoresService";
import { useAuthStore } from "@/stores/auth";
import { getCurrentUser } from "@/utils/auth";

import AlertasVencimiento from "@/components/AlertasVencimiento.vue";
import DashboardHeader from "@/components/DashboardHeader.vue";
import InventarioControls from "@/components/InventarioControls.vue";
import TablaInventario from "@/components/TablaInventario.vue";
import EditarMedicamentoModal from "@/components/EditarMedicamentoModal.vue";
import SolicitarMedicamentoModal from "@/components/SolicitarMedicamentoModal.vue";
import AgregarMedicamentoModal from "@/components/AgregarMedicamentoModal.vue";

const medications = ref([]);      // Lista de medicamentos cargados
const proveedores = ref([]);      // Lista de proveedores cargados
const searchTerm = ref("");       // Término de búsqueda en tabla
const loading = ref(true);        // Estado de carga
const error = ref(null);          // Mensaje de error

const authStore = useAuthStore();
const userRole = computed(() => authStore.userRole); // Rol del usuario actual

 // ===== Manejo de modales ===== 
const medEditar = ref(null); // Medicamento en edición
const modales = ref({
  editar: false,
  solicitar: false,
  agregar: false,
});

//Abre modal 
const abrirModal = (tipo, med = null) => {
  if (!modales.value.hasOwnProperty(tipo)) return; // Validación de tipo
  if (tipo === "editar") medEditar.value = med;
  modales.value[tipo] = true;
};

//Cierra modal 
const cerrarModal = (tipo) => {
  if (!modales.value.hasOwnProperty(tipo)) return; // Validación de tipo
  modales.value[tipo] = false;
  if (tipo === "editar") medEditar.value = null;
};


 //Carga la lista de medicamentos y proveedores desde el backend.
const cargarMedicamentos = async () => {
  try {
    loading.value = true;
    error.value = null;
    medications.value = await listarMedicamentos();
    proveedores.value = await listarProveedores();
  } catch (err) {
    console.error(err);
    error.value = "Error al cargar medicamentos.";
  } finally {
    loading.value = false;
  }
};



//Filtra medicamentos según nombre, proveedor o lote.
const filteredMedications = computed(() => {
  const term = searchTerm.value.toLowerCase().trim();
  if (!term) return medications.value;

  return medications.value.filter((med) => {
    if (!med) return false;

    const name = med.nombre?.toLowerCase() || "";
    const proveedor = med.proveedorId?.nombre?.toLowerCase() || "";
    const lotes = Array.isArray(med.lotes)
      ? med.lotes.map((l) => l?.lote?.toLowerCase() || "").join(",")
      : "";

    return (
      name.includes(term) ||
      proveedor.includes(term) ||
      lotes.includes(term)
    );
  });
});


// agregarMedicamento
const agregarMedicamento = async (nuevoMed) => {
  try {
    // Llamada al backend para crear medicamento
    const creado = await crearMedicamento(nuevoMed);

    // Lo agregamos a la lista local para actualizar la tabla
    medications.value.push(creado);

    // Cerrar modal
    cerrarModal("agregar");
  } catch (err) {
    console.error(err);
    alert("Error al agregar medicamento.");
  }
};

//Actualiza un medicamento en la lista local tras ser editado. 

const actualizarMedicamentoEnLista = (updatedMed) => {
  if (!updatedMed?._id) return;

  const index = medications.value.findIndex((m) => m._id === updatedMed._id);
  if (index !== -1) {
    // Clonamos el objeto actualizado para forzar reactividad
    medications.value[index] = { ...updatedMed };

    // Opcional: forzar que Vue detecte cambios en todo el array
    medications.value = [...medications.value];
  }
};


// ===== Montaje inicial =====
onMounted(() => {
  cargarMedicamentos();
});
</script>
