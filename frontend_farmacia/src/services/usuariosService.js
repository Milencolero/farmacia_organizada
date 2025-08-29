import api from "./api.js";

export const listarUsuarios = async () => {
  const res = await api.get("/usuarios");
  return res.data.items || res.data;
};

export const crearUsuario = async (data) => {
  const res = await api.post("/usuarios", data);
  return res.data;
};

export const actualizarUsuario = async (id, data) => {
  const res = await api.put(`/usuarios/${id}`, data);
  return res.data;
};

export const eliminarUsuario = async (id) => {
  const res = await api.delete(`/usuarios/${id}`);
  return res.data;
};
