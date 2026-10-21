
import Chart from "react-apexcharts";
import { situacoes } from "../utils/situacao";

export default function GraficoModal({ tarefas, onClose }) {
  // Descobre quais tarefas estão atrasadas
  const hoje = new Date();

  // Zera as horas, minutos, segundos e milissegundos para comparar apenas a data
  hoje.setHours(0, 0, 0, 0);

  // Filtra as tarefas que estão atrasadas (pendentes e com data limite menor que hoje)
  const tarefasAtrasadas = tarefas.filter((tarefa) => {
    const prazo = new Date(tarefa.dataLimite);

    // Zera o horário da data limite
    prazo.setHours(0, 0, 0, 0);

    return (
      tarefa.situacao === "Pendente" &&
      prazo < hoje
    );
  });

  // Conta as tarefas pendentes que ainda estão dentro do prazo
  const totalPendentesNoPrazo = tarefas.filter((tarefa) => {
    const prazo = new Date(tarefa.dataLimite);
    prazo.setHours(0, 0, 0, 0);

    return (
      tarefa.situacao === "Pendente" &&
      prazo >= hoje
    );
  }).length;

  // Conta as tarefas de cada categoria, sem duplicar as atrasadas
  const series = [
    totalPendentesNoPrazo,
    tarefas.filter((tarefa) => tarefa.situacao === "Concluida").length,
    tarefas.filter((tarefa) => tarefa.situacao === "Cancelada").length,
    tarefasAtrasadas.length,
  ];

  const options = {
    labels: ["Pendentes no prazo", "Concluídas", "Canceladas", "Atrasadas"],
    legend: { position: "bottom" },
    dataLabels: { enabled: true },
    colors: ["#eab308", "#22c55e", "#ef4444", "#f97316"],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="grafico-titulo"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl"
      >
        <header className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4">
          <h2 id="grafico-titulo" className="text-lg font-bold text-gray-800">
            Tarefas por situação
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar gráfico"
            className="rounded-lg px-2.5 py-1 text-xl font-bold text-gray-400 hover:bg-gray-200 hover:text-gray-600"
          >
            ✕
          </button>
        </header>

        <div className="p-4">
          {tarefas.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              Não há tarefas para exibir.
            </p>
          ) : (
            <Chart
              options={options}
              series={series}
              type="pie"
              width="100%"
              height={320}
            />
          )}
        </div>
      </section>
    </div>
  );
}
