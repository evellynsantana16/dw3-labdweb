
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  atualizarSituacao,
  listarTarefas,
  deletarTarefa, // NOVO: importa a função que chama o DELETE no backend
} from "../api";


import TodoItem from "../components/TodoItem";
import GraficoModal from "../components/GraficoModal";

export default function TodoList({ usuarioLogado }) {
  // Indica se as tarefas estão sendo carregadas
  const [loading, setLoading] = useState(false);

  // Guarda mensagens de erro para mostrar na tela
  const [error, setError] = useState(null);

  // Guarda a lista de tarefas que será exibida no React
  const [tarefas, setTarefas] = useState([]);

  // Guarda a situação selecionada no filtro
  const [situacaoFiltro, setSituacaoFiltro] = useState("");

  // Controla se o modal do gráfico está aberto
  const [isChartOpen, setIsChartOpen] = useState(false);

  // Filtra as tarefas conforme a situação escolhida.
  // Se nenhuma situação foi selecionada, mostra todas.
  const tarefasFiltradas = tarefas.filter((tarefa) => {
    // Se nenhuma situação foi selecionada, mostra todas.
    if (!situacaoFiltro) return true;

    // Se o filtro for Atrasada, calcula usando a data limite.
    if (situacaoFiltro === "Atrasada") {
      const prazo = new Date(tarefa.dataLimite);
      const hoje = new Date();

      // Zera o horário para comparar apenas as datas.
      prazo.setHours(0, 0, 0, 0);
      hoje.setHours(0, 0, 0, 0);

      // Só considera atrasadas as tarefas pendentes cujo prazo passou.
      return tarefa.situacao === "Pendente" && prazo < hoje;
    }

    // Para as outras opções, filtra pela situação normalmente.
    return tarefa.situacao === situacaoFiltro;
  });

  // Executa quando o componente é montado na tela.
  // Busca as tarefas no backend e guarda a resposta no estado.
  useEffect(() => {
    const carregarTarefas = async () => {
      setLoading(true);

      try {
        const response = await listarTarefas();
        setTarefas(response.data.tarefas);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    carregarTarefas();
  }, []);

  // Atualiza a situação de uma tarefa.
  // Essa função já existia no código.
  const mudarSituacao = async (id, novaSituacao) => {
    try {
      await atualizarSituacao(id, novaSituacao);

      // Cria uma nova lista, alterando a situação somente
      // da tarefa cujo ID corresponde ao ID recebido.
      setTarefas((atuais) =>
        atuais.map((tarefa) =>
          tarefa._id === id
            ? { ...tarefa, situacao: novaSituacao }
            : tarefa,
        ),
      );
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    }
  };

  // NOVO: exclui uma tarefa pelo ID.
  // Essa função será chamada quando o usuário clicar no botão Excluir.
  const excluirTarefa = async (id) => {
    try {
      // Envia uma requisição DELETE ao backend e espera
      // a confirmação de que a tarefa foi excluída.
      await deletarTarefa(id);

      // Só depois da resposta de sucesso, atualiza a lista.
      // filter cria uma nova lista mantendo todas as tarefas
      // cujo ID seja diferente do ID excluído.
      setTarefas((atuais) =>
        atuais.filter((tarefa) => tarefa._id !== id),
      );
    } catch (error) {
      // Se a exclusão falhar, mostra a mensagem de erro.
      // A tarefa não é removida da lista nesse caso.
      setError(error.response?.data?.message || error.message);
    }
  };

  const navigate = useNavigate();

  // Abre o formulário de edição da tarefa selecionada
  const editarTarefaSelecionada = (id) => {
    navigate(`/editar/${id}`);
  };

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-4">
          {/* Link que abre o formulário de criação de tarefa */}
          <Link
            to="/new"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded shadow-sm transition-all"
          >
            Nova Tarefa
          </Link>

          {/* Abre o modal com o gráfico das tarefas */}
          <button
            type="button"
            onClick={() => setIsChartOpen(true)}
            className="rounded bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200 cursor-pointer transition-all"
          >
            Ver gráfico
          </button>

          {/* Filtro para mostrar tarefas por situação */}
          <div className="flex items-center gap-4">
            <label>Filtrar por situação:</label>

            <select
              value={situacaoFiltro}
              onChange={(event) => setSituacaoFiltro(event.target.value)}
              aria-label="Filtro de situação"
            >
              <option value="">Todas</option>
              <option value="Pendente">Pendente</option>
              <option value="Concluida">Concluida</option>
              <option value="Cancelada">Cancelada</option>
              <option value="Atrasada">Atrasadas</option>
            </select>
          </div>
        </div>

        {/* Mensagem enquanto as tarefas estão sendo carregadas */}
        {loading && <p>Carregando...</p>}

        {/* Mostra erros da requisição ou da operação */}
        {error && (
          <p className="text-red-600">
            {error.response?.data?.message || error.message}
          </p>
        )}

        <div className="space-y-3">
          {/* Se não houver tarefas, mostra uma mensagem */}
          {tarefasFiltradas.length === 0 && !loading ? (
            <p className="text-gray-500">Nenhuma Tarefa encontrada!</p>
          ) : (
            // Percorre a lista e cria um cartão TodoItem para cada tarefa.
            tarefasFiltradas.map((t) => (
              <TodoItem
                key={t._id}
                todo={t}
                usuarioLogado={usuarioLogado}
                onSituacaoChange={mudarSituacao}

                // NOVO: entrega a função de exclusão ao TodoItem.
                // O cartão chamará essa função passando o ID da tarefa.
                onDelete={excluirTarefa}

                onEdit={editarTarefaSelecionada}
              />
            ))
          )}
        </div>
      </div>

      {/* Só renderiza o modal quando o gráfico está aberto */}
      {isChartOpen && (
        <GraficoModal
          tarefas={tarefas}
          onClose={() => setIsChartOpen(false)}
        />
      )}
    </>
  );
}

/*TodoItem.jsx

Clica em Excluir e envia o ID

TodoList.jsx

Executa excluirTarefa(id)

api.js

Envia DELETE /tarefas/:id

Backend + MongoDB

Exclui a tarefa e responde ao frontend*/
