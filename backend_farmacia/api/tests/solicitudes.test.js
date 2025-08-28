import request from "supertest";
import app from "../app.js";
import Medicamento from "../src/models/Medicamento.js";

let tokenTens;
let idSolicitud;

beforeAll(async () => {
  // Login TENS para obtener token
  const resLogin = await request(app)
    .post("/api/v1/auth/login")
    .send({ correo: "tens@cesfam.local", password: "Tens2025!" });

  tokenTens = resLogin.body.token;
});

describe("Solicitudes", () => {
  it("Crear solicitud TENS", async () => {
    const med = await Medicamento.findOne({ nombre: "Paracetamol Test" });
    if (!med) throw new Error("No existe medicamento 'Paracetamol Test' en DB de test");

    const res = await request(app)
      .post("/api/v1/solicitudes")
      .set("Authorization", `Bearer ${tokenTens}`)
      .send({
        items: [{ medicamentoId: med._id, cantidad: 2 }],
        observaciones: "Prueba"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.items.length).toBeGreaterThan(0);
    idSolicitud = res.body._id;
  });

  it("Listar solicitudes filtradas por usuario", async () => {
    // Suponiendo que tu endpoint obtiene usuario desde token
    const res = await request(app)
      .get("/api/v1/solicitudes")
      .set("Authorization", `Bearer ${tokenTens}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });
});
