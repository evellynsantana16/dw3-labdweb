# COLINHA 1 --- PROVA DE NODE.JS

## O que mudamos no ToDo e como adaptar em outro projeto

> Este guia registra o que trabalhamos no ToDo. Em outro projeto, os
> nomes dos arquivos e funções podem ser diferentes: localize o fluxo
> antes de copiar código.

## 1. O que já implementamos

  -----------------------------------------------------------------------
  Operação                O que faz               Fluxo neste projeto
  ----------------------- ----------------------- -----------------------
  **Create**              Cria tarefa             `TodoForm.jsx` →
                                                  `api.js` →
                                                  rota/controller →
                                                  MongoDB

  **Read**                Lista tarefas           `TodoList.jsx` →
                                                  `listarTarefas()` →
                                                  backend

  **Update**              Edita tarefa            botão Editar →
                                                  `/editar/:id` →
                                                  `TodoForm.jsx` →
                                                  `editarTarefa()`

  **Delete**              Exclui tarefa           `TodoItem.jsx` →
                                                  `TodoList.jsx` →
                                                  `deletarTarefa()` →
                                                  `DELETE /tarefas/:id`
  -----------------------------------------------------------------------

Outras mudanças que fizemos: - Exclusão com verificação de permissão no
backend. - Edição parcial usando `PATCH /tarefas/:id`. - Reutilização do
formulário para criar e editar. - Preenchimento automático do formulário
ao editar. - Botões Editar e Excluir no cartão, ao lado do Chat. -
Filtro de tarefas atrasadas. - Gráfico com categorias exclusivas:
pendentes no prazo, concluídas, canceladas e atrasadas.

## 2. Como pensar se a professora pedir algo novo

### Primeiro: identifique o tipo de pedido

-   **Novo campo:** schema/model + formulário + controller + exibição.
-   **Novo botão:** componente que mostra o cartão ou a página.
-   **Filtro ou cálculo:** página que possui o array; talvez o
    componente de gráfico.
-   **Criar/editar/excluir no banco:** `api.js` + rota + controller +
    model.
-   **Permissões:** middleware e controller.
-   **Novo endpoint:** arquivo de rotas e método no controller.
-   **Gráfico:** cálculo das quantidades + `GraficoModal.jsx`.
-   **Voz:** hook de reconhecimento + componente que consome o texto.
-   **Chat em tempo real:** modal do chat, rotas de histórico e eventos
    Socket.IO.

### Fluxo para uma ação que salva dados

**Botão/formulário React → função do componente → `api.js` → rota
Express → controller → model/MongoDB → resposta HTTP → atualização do
estado React.**

Nem todo pedido exige alterar todas as camadas. Um filtro sobre dados já
carregados pode exigir apenas uma mudança no React.

## 3. Receitas de prova

### A) Criar uma rota de exclusão

1.  Declare `DELETE` no arquivo de rotas.
2.  No controller, leia o ID com `req.params.id`.
3.  Busque o documento.
4.  Se não existir, responda `404`.
5.  Verifique permissões, se necessário.
6.  Exclua com Mongoose e retorne uma resposta.
7.  No frontend, crie a função Axios em `api.js`.
8.  Após sucesso, atualize a lista com `filter()`.

### B) Criar edição de um registro

1.  Backend: crie/ajuste rota `PATCH` ou `PUT`.
2.  Controller: busque por ID, valide existência/permissão, aplique
    campos e salve.
3.  `api.js`: crie a função que envia ID e dados.
4.  React: botão Editar e rota com ID.
5.  Use `useParams()` para ler o ID.
6.  Carregue os dados e preencha os estados.
7.  No envio, escolha editar ou criar conforme exista ID.
8.  Teste se as alterações persistem após recarregar.

### C) Filtrar ou contar registros

Se os dados já estão em um array, use `filter()`:

``` js
const resultado = itens.filter((item) => item.condicao === valor);
const quantidade = resultado.length;
```

Exemplo de tarefas atrasadas:

``` js
const hoje = new Date();
hoje.setHours(0, 0, 0, 0);

const atrasadas = tarefas.filter((tarefa) => {
  const prazo = new Date(tarefa.dataLimite);
  prazo.setHours(0, 0, 0, 0);
  return tarefa.situacao === "Pendente" && prazo < hoje;
});
```

Neste projeto, **Atrasada não é uma situação salva no banco**: é
calculada pela data limite e pela situação pendente.

### D) Adicionar uma categoria ao gráfico

1.  Calcule a quantidade de cada categoria.
2.  Garanta que `series`, `labels` e `colors` estejam na mesma ordem e
    tenham quantidades compatíveis.
3.  Evite contar um registro duas vezes se as fatias devem ser
    exclusivas.

### E) Adicionar um campo ao formulário

1.  Crie/identifique o estado com `useState`.
2.  Ligue o campo ao estado com `value` e `onChange`.
3.  Inclua o campo no objeto enviado pela API.
4.  Confira se controller e schema aceitam o campo.
5.  Se tiver opções limitadas, confira o `enum`.

## 4. Termos e comandos importantes

-   `req.params`: valores da URL, por exemplo `/:id`.
-   `req.body`: dados enviados no corpo da requisição.
-   `req.user`: usuário autenticado, se o middleware o disponibilizar.
-   `res.status(200).json(...)`: responde com status HTTP e JSON.
-   `findById(id)`: busca documento pelo ID.
-   `findByIdAndDelete(id)`: busca e exclui.
-   `save()`: salva alterações no documento.
-   `filter()`: seleciona itens que passam por uma condição.
-   `map()`: transforma itens de um array.
-   `length`: quantidade de itens.
-   `useState`: guarda estado React.
-   `useEffect`: executa efeitos, como carregar dados.
-   `useParams`: lê parâmetros da rota React.
-   `useNavigate`: navega por código.
-   `PATCH`: normalmente atualiza parte de um recurso.
-   `DELETE`: solicita exclusão.

## 5. Erros que já vimos

-   **`Identifier Link has already been declared`**: import duplicado;
    mantenha apenas um import com os nomes necessários.
-   **`Identifier useNavigate has already been declared`**: mesma causa.
-   **Gráfico branco**: confira o Console do navegador; pode haver
    variável não declarada ou divergência entre rótulos e valores.
-   **Botões fora do cartão**: confira se estão dentro da `div` que
    representa o cartão.
-   **Lista não atualiza após excluir**: atualize o estado React depois
    da resposta de sucesso.
-   **Filtro não encontra "Atrasada"**: essa situação é calculada, não
    armazenada.

## 6. Se for outro projeto

Localize: 1. componente/página que exibe a lista; 2. formulário; 3.
arquivo de chamadas HTTP (`api.js`, `services` etc.); 4. rotas backend;
5. controller; 6. model/schema; 7. middleware de autenticação/permissão.

> **Regra de ouro:** descubra onde os dados são recebidos, processados,
> guardados e exibidos. Depois altere somente as camadas necessárias.
