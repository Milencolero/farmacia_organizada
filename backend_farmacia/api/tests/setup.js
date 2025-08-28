import mongoose from "mongoose";
import { config } from "../src/config.js";
import User from "../src/models/User.js";
import Proveedor from "../src/models/Proveedor.js";
import Medicamento from "../src/models/Medicamento.js";
import bcrypt from "bcrypt";

jest.setTimeout(30000); // 30 segundos

beforeAll(async () => {
  // Conectar a la base de datos de test
  await mongoose.connect(config.mongoUri);

  // ====================
  // Crear Admin y TENS
  // ====================
  const adminEmail = "admin@cesfam.local";
  const tensEmail = "tens@cesfam.local";

  if (!await User.findOne({ correo: adminEmail })) {
    await User.create({
      nombre: "Admin CESFAM",
      correo: adminEmail,
      passwordHash: await bcrypt.hash("Admin2025!", 11),
      rol: "ADMIN"
    });
  }

  if (!await User.findOne({ correo: tensEmail })) {
    await User.create({
      nombre: "TENS CESFAM",
      correo: tensEmail,
      passwordHash: await bcrypt.hash("Tens2025!", 11),
      rol: "TENS"
    });
  }

  // ====================
  // Crear Proveedor
  // ====================
  let proveedor = await Proveedor.findOne({ nombre: "Proveedor Test" });
  if (!proveedor) {
    proveedor = await Proveedor.create({ nombre: "Proveedor Test" });
  }

  // ====================
  // Crear Medicamentos de prueba
  // ====================
  const meds = [
    {
      nombre: "Paracetamol 500mg",
      stockTotal: 100,
      proveedorId: proveedor._id,
      lotes: [{
        lote: "L001",
        cantidad: 100,
        fechaIngreso: new Date(),
        fechaVencimiento: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      }]
    },
    {
      nombre: "Ibuprofeno 400mg",
      stockTotal: 50,
      proveedorId: proveedor._id,
      lotes: [{
        lote: "L002",
        cantidad: 50,
        fechaIngreso: new Date(),
        fechaVencimiento: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      }]
    },
    // Medicamento específico para test de solicitudes
    {
      nombre: "Paracetamol Test",
      stockTotal: 10,
      proveedorId: proveedor._id,
      lotes: [{
        lote: "L_TEST",
        cantidad: 10,
        fechaIngreso: new Date(),
        fechaVencimiento: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      }]
    }
  ];

  for (const med of meds) {
    if (!await Medicamento.findOne({ nombre: med.nombre })) {
      await Medicamento.create(med);
    }
  }

  console.log("Setup de test completado.");
});

afterAll(async () => {
  // Limpiar DB de test
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});
