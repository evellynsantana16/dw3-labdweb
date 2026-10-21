import { Router } from "express";
import TarefaController from "../controllers/tarefa.controller.js";
import userMiddleware from "../middleware/user.js";

const tarefaRoutes = Router();

//POST: Criar/Atualizar
//GET: Busca/Listar
//PATCH: Atualizar/
//PUT: Mudar Tudo
//DELETE: Deleta tudo 
tarefaRoutes.post("/", userMiddleware, TarefaController.criarTarefa);
tarefaRoutes.get("/", userMiddleware, TarefaController.listarTarefas);
tarefaRoutes.patch("/", userMiddleware, TarefaController.atualizarSituacao);
//tudo por id pq precisa dele pra identificar a tarefa q vai ser deletada ou editada
tarefaRoutes.delete("/:id", userMiddleware, TarefaController.deletarTarefa);
tarefaRoutes.patch("/:id", userMiddleware, TarefaController.editarTarefa);
export default tarefaRoutes;
