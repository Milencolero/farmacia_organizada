import request from "supertest";
import app from "../app.js";

describe("Auth Endpoints", () => {
  it("Login ADMIN correcto", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ correo: "admin@cesfam.local", password: "Admin2025!" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.rol).toBe("ADMIN");
  });

  it("Login TENS correcto", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ correo: "tens@cesfam.local", password: "Tens2025!" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.rol).toBe("TENS");
  });

  it("Login falla con password incorrecto", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ correo: "admin@cesfam.local", password: "WrongPass" });
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Credenciales inválidas");
  });
});
