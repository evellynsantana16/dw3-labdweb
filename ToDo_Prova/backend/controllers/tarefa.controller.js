import Tarefa from "../models/tarefa.js";

export default class TarefaController {
  static async criarTarefa(req, res) {
    const { titulo, descricao, dataLimite, situacao, participam } = req.body;
    const usuarioLogado = req.user.id;

    if (!titulo || !descricao || !dataLimite || !situacao) {
      return res
        .status(422)
        .json({ message: "Todos os campos são obrigatórios." });
    }

    try {
      const tarefa = new Tarefa({
        titulo,
        descricao,
        dataLimite,
        situacao,
        criadaPor: usuarioLogado,
        participam: Array.isArray(participam)
          ? participam
          : participam
            ? [participam]
            : [],
      });

      //guarda o objeto 
      const novaTarefa = await tarefa.save();
      //guarda o resultado da busca pela tarefa criada, populando os campos de referência
      const tarefaPopulada = await Tarefa.findById(novaTarefa._id)

      //depois de buscar a tarefa pelo id q acabo de cadastra, aparece q foi criada por q é o campo
      //q guarda a referencia do usuario q criou a tarefa, e o campo q guarda 
      //os usuarios q participam da tarefa
        .populate("criadaPor", "nome email")
        .populate("participam", "nome email");

      return res.status(200).json({
        message: "Tarefa criada com sucesso.",
        //contem os dados da tarefa, os valores vem do tarefaPopulada, q é 
        // o resultado da busca pela tarefa criada, populando os campos de referência
        novaTarefa: tarefaPopulada,
      });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao criar tarefa.", error });
    }
  }

  static async listarTarefas(req, res) {
    const usuarioLogado = req.user.id;

    try {
      const tarefas = await Tarefa.find({
        $or: [{ criadaPor: usuarioLogado }, { participam: usuarioLogado }],
      })
        .populate("criadaPor", "nome")
        .populate("participam", "nome")
        .sort({ createdAt: -1 });

      return res
        .status(200)
        .json({ message: "Tarefas listadas com sucesso.", tarefas });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Erro ao listar tarefas.", error });
    }
  }

  static async atualizarSituacao(req, res) {
    const { id, novaSituacao } = req.body;
    const usuarioLogado = req.user.id;

    try {
      const tarefa = await Tarefa.findById(id);
      if (!tarefa) {
        return res.status(404).json({ message: "Tarefa não encontrada." });
      }

      const podeAlterar =
        tarefa.criadaPor.toString() === usuarioLogado ||
        tarefa.participam.some(
          (participante) => participante.toString() === usuarioLogado,
        );
      if (!podeAlterar) {
        return res
          .status(403)
          .json({ message: "Sem permissão para alterar esta tarefa." });
      }

      tarefa.situacao = novaSituacao;
      await tarefa.save();

      return res
        .status(200)
        .json({ message: "Situação atualizada com sucesso.", tarefa });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Erro ao atualizar situação.", error });
    }
  }

  static async deletarTarefa(req, res) {
    const { id } = req.params;
    const usuarioLogado = req.user.id;

    try {
    const tarefa = await Tarefa.findById(id);

    if (!tarefa) {
      return res.status(404).json({ message: "Tarefa não encontrada." });
    }
    
    //verifica se o usuario logado é o criador da tarefa ou se ele participa da tarefa
    const podeDeletar = tarefa.criadaPor.toString() === usuarioLogado || tarefa.participam.some(
      (participante) => participante.toString() === usuarioLogado,
    );

    if (!podeDeletar) {
      return res.status(403).json({ message: "Sem permissão para deletar esta tarefa." });
    }
    await Tarefa.findByIdAndDelete(id);
    return res.status(200).json({ message: "Tarefa deletada com sucesso." });
  }

    catch (error) {
      return res.status(500).json({ message: "Erro ao deletar tarefa.", error });
    }

  }

  
static async editarTarefa(req, res) {
    // Pega o ID da tarefa que veio pela URL
    const { id } = req.params;

    // Pega os dados enviados pelo frontend para atualizar a tarefa
    const { titulo, descricao, dataLimite, situacao, participam } = req.body;

    // Pega o ID do usuário autenticado pelo middleware
    const usuarioLogado = req.user.id;

    try {
        // Procura a tarefa no MongoDB pelo ID informado
        const tarefa = await Tarefa.findById(id);

        // Se não encontrar a tarefa, retorna erro 404
        if (!tarefa) {
            return res.status(404).json({
                message: "Tarefa não encontrada."
            });
        }

        // Verifica se o usuário logado criou a tarefa
        // OU se ele participa dessa tarefa
        const podeEditar =
            tarefa.criadaPor.toString() === usuarioLogado ||
            tarefa.participam.some(
                (participante) => participante.toString() === usuarioLogado
            );

        // Se o usuário não tiver permissão, retorna erro 403
        if (!podeEditar) {
            return res.status(403).json({
                message: "Sem permissão para editar esta tarefa."
            });
        }

        // Atualiza o título se um novo título tiver sido enviado
        // Caso contrário, mantém o título atual
        tarefa.titulo = titulo || tarefa.titulo;

        // Atualiza a descrição se uma nova descrição tiver sido enviada
        tarefa.descricao = descricao || tarefa.descricao;

        // Atualiza a data limite se uma nova data tiver sido enviada
        tarefa.dataLimite = dataLimite || tarefa.dataLimite;

        // Atualiza a situação se uma nova situação tiver sido enviada
        tarefa.situacao = situacao || tarefa.situacao;

        // Se participam for um array, usa esse array
        // Se for um único participante, transforma em array
        // Se não for enviado, mantém os participantes atuais
        tarefa.participam = Array.isArray(participam)
            ? participam
            : participam
                ? [participam]
                : tarefa.participam;

        // Salva as alterações no MongoDB
        await tarefa.save();

        // Retorna status 200 e a tarefa atualizada
        return res.status(200).json({
            message: "Tarefa editada com sucesso.",
            tarefa
        });

    } catch (error) {
        // Trata erros inesperados durante a edição
        return res.status(500).json({
            message: "Erro ao editar tarefa.",
            error
        });
    }
}
// fim do método editarTarefa



}// fim da classe TarefaController
  

