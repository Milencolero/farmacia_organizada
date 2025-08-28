import request from "supertest";
import app from "../app.js";

let tokenAdmin;
let tokenTens;
let idMedicamento;
let idSolicitud;

beforeAll(async () => {
  // Login ADMIN
  const resAdmin = await request(app)
    .post("/api/v1/auth/login")
    .send({ correo: "admin@cesfam.local", password: "Admin2025!" });
  tokenAdmin = resAdmin.body.token;

  // Login TENS
  const resTens = await request(app)
    .post("/api/v1/auth/login")
    .send({ correo: "tens@cesfam.local", password: "Tens2025!" });
  tokenTens = resTens.body.token;

  // Crear medicamento de prueba
  const medRes = await request(app)
    .post("/api/v1/medicamentos")
    .set("Authorization", `Bearer ${tokenAdmin}`)
    .send({
      nombre: "Paracetamol Test",
      proveedorId: "ID_DEL_PROVEEDOR", // asegúrate de crear proveedor primero si hace falta
      stockTotal: 10
    });
  idMedicamento = medRes.body._id;

  // Crear solicitud TENS
  const solRes = await request(app)
    .post("/api/v1/solicitudes")
    .set("Authorization", `Bearer ${tokenTens}`)
    .send({
      items: [{ medicamentoId: idMedicamento, cantidad: 2 }],
      observaciones: "Solicitud para test"
    });
  idSolicitud = solRes.body._id;
});

describe("Entregas", () => {
  it("Entregar solicitud aprobada", async () => {
    const res = await request(app)
      .post(`/api/v1/solicitudes/${idSolicitud}/entregar`)
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("detalles");
  });

  it("No entregar si stock insuficiente", async () => {
    // Crear otra solicitud con cantidad mayor al stock
    const resSol = await request(app)
      .post("/api/v1/solicitudes")
      .set("Authorization", `Bearer ${tokenTens}`)
      .send({
        items: [{ medicamentoId: idMedicamento, cantidad: 100 }],
        observaciones: "Solicitud con stock insuficiente"
      });
    const idSolicitudStockBajo = resSol.body._id;

    const res = await request(app)
      .post(`/api/v1/solicitudes/${idSolicitudStockBajo}/entregar`)
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/stock/i);
  });
});
