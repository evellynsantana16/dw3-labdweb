import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  criarTarefa,
  editarTarefa,
  listarTarefas,
  getUsersExceptLogged,
} from "../api";
import { useVoiceRecognition } from "../hooks/useVoiceRecognition";

export default function TodoForm() {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataLimite, setDataLimite] = useState("");
  const [participam, setParticipam] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);

  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Se existir um ID na URL, estamos editando uma tarefa.
// Se não existir, estamos criando uma tarefa nova.
const { id } = useParams();

const modoEdicao = Boolean(id);

  const {
    textoOuvido,
    ouvindo,
    iniciarEscuta,
    pararEscuta,
    processarComandoVoz,
    suportado,
  } = useVoiceRecognition();

  const handleCheckboxChange = useCallback(
    (userId) => {
      setParticipam((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId],
      );
    },
    [setParticipam],
  );

  const selecionarParticipantePorVoz = useCallback((userId) => {
    setParticipam((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
  }, []);

  // Processar a fala passando lista de usuários e a função para marcar checkbox
  useEffect(() => {
    if (ouvindo || !textoOuvido || loadingUsuarios) return;

    processarComandoVoz(
      textoOuvido,
      setTitulo,
      setDescricao,
      setDataLimite,
      usuarios,
      selecionarParticipantePorVoz,
    );
  }, [
    textoOuvido,
    ouvindo,
    loadingUsuarios,
    usuarios,
    processarComandoVoz,
    selecionarParticipantePorVoz,
  ]);

  useEffect(() => {
    async function fetchUsuarios() {
      try {
        setLoadingUsuarios(true);
        const res = await getUsersExceptLogged();
        const lista = res?.data?.usuarios || [];

        // Garante que só seta se for realmente um Array
        setUsuarios(Array.isArray(lista) ? lista : []);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
        setUsuarios([]);
      } finally {
        setLoadingUsuarios(false);
      }
    }
    fetchUsuarios();
  }, []);


const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);

  try {
    // Monta os dados que serão enviados ao backend
    const tarefa = {
      titulo,
      descricao,
      dataLimite,
      participam,
    };

    if (modoEdicao) {
      // Se existe um ID na URL, atualiza a tarefa existente
      await editarTarefa(id, tarefa);
    } else {
      // Se não existe ID, cria uma tarefa nova
      await criarTarefa({
        ...tarefa,
        situacao: "Pendente",
      });
    }

    // Volta para a lista após salvar
    navigate("/tarefas");
  } catch (error) {
    alert(
      error.response?.data?.message ||
        "Erro ao salvar a tarefa."
    );
  } finally {
    setSaving(false);
  }
};


  // Busca os dados da tarefa quando estamos no modo de edição
useEffect(() => {
  // Sem ID na URL, é uma tarefa nova. Não precisamos buscar nada.
  if (!id) return;

  const carregarTarefa = async () => {
    try {
      // Busca as tarefas disponíveis para o usuário logado
      const response = await listarTarefas();

      // Encontra a tarefa que corresponde ao ID da URL
      const tarefa = response.data.tarefas.find(
        (tarefa) => tarefa._id === id
      );

      // Se não encontrar a tarefa, avisa o usuário
      if (!tarefa) {
        alert("Tarefa não encontrada.");
        navigate("/tarefas");
        return;
      }

      // Preenche os campos do formulário com os dados existentes
      setTitulo(tarefa.titulo || "");
      setDescricao(tarefa.descricao || "");

      // O campo de data do HTML precisa receber o formato AAAA-MM-DD
      setDataLimite(
        tarefa.dataLimite
          ? new Date(tarefa.dataLimite).toISOString().slice(0, 10)
          : ""
      );

      // Os participantes podem vir como objetos com _id ou como IDs
      setParticipam(
        (tarefa.participam || []).map((participante) =>
          typeof participante === "object"
            ? participante._id
            : participante
        )
      );
    } catch (error) {
      console.error("Erro ao carregar tarefa:", error);
      alert(
        error.response?.data?.message ||
          "Não foi possível carregar a tarefa."
      );
    }
  };

  carregarTarefa();
}, [id, navigate]);

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
       <h2>{modoEdicao ? "Editar Tarefa" : "Nova Tarefa"}</h2>

        {/* BOTÃO LIGA/DESLIGA O MICROFONE */}
        {suportado && (
          <button
            type="button"
            onClick={ouvindo ? pararEscuta : iniciarEscuta}
            className={`px-4 py-2 rounded-lg text-white font-medium text-sm transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
              ouvindo
                ? "bg-red-500 animate-pulse ring-4 ring-red-200"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            🎙️ {ouvindo ? "Clique para Parar" : "Preencher por Voz"}
          </button>
        )}
      </div>

      {/* PAINEL DE DICAS DE COMANDOS */}
      {suportado && (
        <div className="mb-6 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-800 space-y-1">
          <p className="font-semibold">💡 Dicas de Comandos por Voz:</p>
          <ul className="list-disc list-inside space-y-0.5 text-indigo-700">
            <li>
              <strong>"Título [seu texto]"</strong> — Preenche o título
            </li>
            <li>
              <strong>"Descrição [seu texto]"</strong> — Preenche a descrição
            </li>
            <li>
              <strong>"Data [amanhã / hoje / daqui a 3 dias]"</strong> — Define
              o prazo
            </li>
            <li>
              <strong>"Participante [nome]"</strong> ou{" "}
              <strong>"Adicionar [nome]"</strong> — Seleciona o participante
            </li>
            <li>
              Fale um comando por vez e aguarde terminar de falar antes de
              iniciar o próximo.
            </li>
          </ul>
        </div>
      )}

      {(ouvindo || textoOuvido) && (
        <p
          aria-live="polite"
          className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700"
        >
          <strong>{ouvindo ? "Transcrição até agora:" : "Transcrição:"}</strong>{" "}
          {textoOuvido || "Aguardando fala..."}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* TÍTULO */}
        <div>
          <label className="block text-sm font-medium mb-1">Título</label>
          <input
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Digite ou fale 'Título...'"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* DESCRIÇÃO */}
        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea
            required
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Digite ou fale 'Descrição...'"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* DATA LIMITE */}
        <div>
          <label className="block text-sm font-medium mb-1">Data Limite</label>
          <input
            required
            value={dataLimite}
            onChange={(e) => setDataLimite(e.target.value)}
            type="date"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* PARTICIPANTES */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Participantes
          </label>

          {loadingUsuarios ? (
            <p className="text-sm text-gray-500">Carregando usuários...</p>
          ) : (
            <div className="max-h-40 overflow-y-auto border rounded p-3 space-y-2 bg-gray-50">
              {usuarios.length > 0 ? (
                usuarios.map((user) => {
                  const userId = user._id || user.id;
                  return (
                    <label
                      key={userId}
                      className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        value={userId}
                        checked={participam.includes(userId)}
                        onChange={() => handleCheckboxChange(userId)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />

                      <span className="text-sm text-gray-700">{user.nome}</span>
                    </label>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 py-1">
                  Nenhum outro usuário disponível para adicionar.
                </p>
              )}
            </div>
          )}
        </div>

        {/* BOTÕES DE AÇÃO */}
        <div className="flex items-center gap-3 pt-4">
          <button
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors cursor-pointer"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border rounded hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
