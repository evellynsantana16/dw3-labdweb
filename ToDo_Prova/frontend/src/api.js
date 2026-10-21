import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true, // Permite o envio de cookies e sessões
  headers: {
    "Content-Type": "application/json",
  },
});

// Tarefas
export const listarTarefas = () => api.get("/tarefas");
export const criarTarefa = (task) => api.post("/tarefas", task);
export const atualizarSituacao = (id, novaSituacao) =>
  api.patch("/tarefas", { id, novaSituacao });
//O ${id} é uma forma de inserir o valor de uma variável dentro de uma template string, que é uma string escrita com crases (`).
export const deletarTarefa = (id) => api.delete(`/tarefas/${id}`);

//tarefaAtualizada é um objeto que contém os dados atualizados da tarefa,
//  como título, descrição, participantes, etc. Esse objeto é enviado no corpo da requisição
//  PATCH para atualizar a tarefa com o ID especificado. 
export const editarTarefa = (id, tarefaAtualizada) =>
  api.patch(`/tarefas/${id}`, tarefaAtualizada);

// Usuários
export const registrarUsuario = (usuario) => api.post("/usuarios", usuario);
export const login = (payload) => api.post("/usuarios/login", payload);
export const logout = () => api.post("/usuarios/logout");
export const resetPassword = (payload) =>
  api.post("/usuarios/resetPassword", payload);
export const forgotPassword = (payload) =>
  api.post("/usuarios/forgotPassword", payload);
export const getProfile = () => api.get("/usuarios/me");
export const getUsersExceptLogged = () =>
  api.get("/usuarios/getUsersExceptLogged");

// Chat
export const getChatHistory = (tarefaId) =>
  api.get(`/chat/getHistory/${tarefaId}`);

export default api;
