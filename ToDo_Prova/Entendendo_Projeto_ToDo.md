# COLINHA 2 --- ENTENDENDO O PROJETO TODO

## Backend, MongoDB, React e como os arquivos conversam

> Este guia descreve o ToDo que trabalhamos. Alguns nomes são
> específicos deste projeto; confira o código real antes de assumir que
> outro projeto usa a mesma estrutura.

# 1. Visão geral

1.  **Frontend (React):** tela com que a pessoa interage.
2.  **`api.js`:** funções que enviam pedidos ao backend.
3.  **Backend (Node.js + Express):** recebe pedidos, aplica regras e
    responde.
4.  **Model/schema (Mongoose):** define a estrutura e permite
    consultar/salvar documentos.
5.  **MongoDB:** guarda os dados persistentes.

Exemplo ao criar tarefa: **Formulário → `criarTarefa()` → rota Express →
controller → model/MongoDB → resposta → lista atualizada.**

O frontend conversa com a API; não acessa diretamente o MongoDB.

# 2. BACKEND

## `index.js` --- entrada do servidor

No ToDo, `backend/index.js` configura e inicia a aplicação: - carrega
variáveis do `.env`; - cria o Express; - configura JSON, cookies e
CORS; - cria servidor HTTP e Socket.IO; - registra rotas de tarefas,
usuários e chat; - disponibiliza Swagger em `/docs`; - inicia o
servidor, normalmente na porta `5000`.

**Express:** facilita criar endpoints HTTP.\
**Middleware:** função executada durante o caminho da requisição.\
**CORS:** controla quais origens podem acessar a API pelo navegador.\
**`express.json()`:** interpreta corpos JSON.\
**`cookieParser()`:** ajuda a ler cookies.\
**Socket.IO:** comunicação em tempo real para o chat.\
**Swagger:** interface para consultar/testar endpoints documentados.

## `routes/` --- caminhos HTTP

`routes/tarefa.routes.js` associa método e caminho a um controller.

Rotas trabalhadas: - `POST /tarefas/` --- criar tarefa; -
`GET /tarefas/` --- listar tarefas; - `PATCH /tarefas/` --- atualizar
situação; - `DELETE /tarefas/:id` --- excluir; - `PATCH /tarefas/:id`
--- editar campos.

Métodos comuns: - **GET:** consultar; - **POST:** criar; - **PATCH:**
alterar parte de um recurso; - **PUT:** normalmente substituir/atualizar
o recurso de forma mais completa; - **DELETE:** excluir.

Em `/tarefas/:id`, `:id` é um parâmetro de URL acessível como
`req.params.id`.

## `controllers/` --- regras e decisões

O controller recebe a requisição, usa os dados, chama o model e constrói
a resposta.

-   `req.params`: parâmetros da URL;
-   `req.body`: campos enviados pelo cliente;
-   `req.user`: usuário autenticado, se o middleware o adicionou;
-   `res.status(...).json(...)`: monta a resposta HTTP em JSON.

Exemplo de raciocínio para excluir: 1. pegar ID; 2. identificar usuário
autenticado; 3. buscar tarefa; 4. responder `404` se não existir; 5.
verificar permissão; 6. responder `403` se não tiver permissão; 7.
excluir; 8. responder sucesso.

Códigos HTTP comuns: - `200`: sucesso; - `201`: recurso criado, quando
adotado pelo endpoint; - `400`: requisição inválida; - `401`: não
autenticado; - `403`: sem permissão; - `404`: não encontrado; - `500`:
erro inesperado no servidor.

## `models/` --- formato dos documentos

No ToDo, o model da tarefa fica em `models/tarefa.js`. Os campos
incluem: - `titulo`; - `descricao`; - `dataLimite`; - `situacao`; -
`criadaPor`; - `participam`; - timestamps, conforme a configuração do
schema.

O model Mongoose permite criar, consultar, alterar e excluir documentos.

### O que é schema?

Schema é a definição da estrutura e das regras dos documentos: campos,
tipos e validações.

Opções Mongoose: - **`type`:** tipo do campo; - **`required: true`:**
campo obrigatório; - **`default`:** valor padrão; - **`enum`:** limita
os valores permitidos; - **`ref`:** referência a outro
model/documento; - **`timestamps: true`:** adiciona datas de criação e
atualização, normalmente `createdAt` e `updatedAt`.

Tipos comuns: - `String`: texto; - `Number`: número; - `Boolean`:
verdadeiro/falso; - `Date`: data; - `Array`: lista; - `ObjectId`:
identificador MongoDB.

### `enum` no ToDo

A situação aceita `Pendente`, `Concluida` e `Cancelada`. Outro valor
pode ser rejeitado pela validação do schema.

**Atrasada não é uma situação salva no schema** que trabalhamos: é
calculada a partir de `dataLimite` e situação pendente.

### `ref` e `populate`

`criadaPor` e `participam` referenciam usuários. A referência guarda o
ID de outro documento. `populate()` pode trazer campos relacionados,
como o nome do usuário, no lugar de retornar somente o ID.

## `middleware/` --- verificações

No ToDo, `middleware/user.js` é usado nas rotas de tarefas. Middleware
pode verificar autenticação, validar dados ou anexar informações à
requisição. Se ele preencher `req.user`, o controller pode usar esse
objeto.

## `socket/` e chat

Socket.IO permite conexão persistente e troca de eventos em tempo real.
Para investigar o chat, procure: - criação do servidor Socket.IO em
`index.js`; - `socket/registerChatSocket.js`, onde eventos são
registrados; - `routes/chat.routes.js` e controller relacionado, para
endpoints/histórico; - `TodoChatModal.jsx`, para a interface.

Confira os nomes reais dos eventos em `socket.on(...)` e
`socket.emit(...)`; não os adivinhe.

# 3. FRONTEND --- React

## O que é React?

React constrói interfaces com **componentes**, partes reutilizáveis da
tela. JSX permite escrever uma estrutura parecida com HTML dentro do
JavaScript.

``` jsx
<h2>{todo.titulo}</h2>
```

As chaves `{}` inserem uma expressão JavaScript no JSX.

## `pages/` --- páginas

No ToDo: - `TodoList.jsx`: carrega e exibe tarefas; - `TodoForm.jsx`:
cria/edita tarefa; - `Login.jsx` e `Register.jsx`: autenticação; -
`LandingPage.jsx`: página inicial.

Uma página coordena estados, chamadas à API e componentes menores.

## `components/` --- peças reutilizáveis

-   `TodoItem.jsx`: cartão individual, com título, descrição, prazo,
    situação, equipe e botões;
-   `TodoChatModal.jsx`: interface do chat;
-   `GraficoModal.jsx`: modal do gráfico.

**Página:** organiza uma tela. **Componente:** representa uma parte da
tela que pode ser reutilizada.

## `api.js` --- ponte com o backend

Centraliza chamadas HTTP. No ToDo: - `listarTarefas()` --- GET; -
`criarTarefa(task)` --- POST; - `atualizarSituacao(id, novaSituacao)`
--- PATCH; - `deletarTarefa(id)` --- DELETE; -
`editarTarefa(id, tarefaAtualizada)` --- PATCH.

Axios é a biblioteca usada para requisições. A configuração pode incluir
`baseURL` e `withCredentials` para cookies.

## `useState` --- estado

Guarda valores que mudam enquanto a tela está aberta. Quando o estado
muda, React renderiza novamente.

``` jsx
const [tarefas, setTarefas] = useState([]);
```

-   `tarefas`: valor atual;
-   `setTarefas`: atualiza o estado;
-   `[]`: array vazio inicial.

Outros estados guardam título, descrição, data, participantes,
carregamento, erro e abertura do modal. Não altere diretamente o array
do estado; crie outro com `map()` ou `filter()` e passe para
`setTarefas()`.

## `useEffect` --- efeitos

Executa efeitos relacionados ao componente, como carregar dados de API.
No `TodoList.jsx`, chama `listarTarefas()`, armazena os dados e controla
carregamento.

## Props --- passar dados e funções

Props são valores passados de um componente para outro.

``` jsx
<TodoItem
  todo={t}
  onDelete={excluirTarefa}
  onEdit={editarTarefaSelecionada}
/>
```

-   `todo`: dados da tarefa;
-   `onDelete`: função para excluir;
-   `onEdit`: função para abrir a edição.

O cartão chama a função recebida; a página pai decide como executar a
ação.

## Eventos e formulários

-   `onClick`: clique;
-   `onChange`: mudança de campo;
-   `onSubmit`: envio de formulário;
-   `event.preventDefault()`: evita o envio padrão que recarregaria a
    página;
-   `value`: valor do campo controlado pelo estado;
-   `setTitulo(...)`: atualiza o estado.

No `TodoForm.jsx`, os campos ficam em estados e o envio monta um objeto
para a API.

## `useParams` e `useNavigate`

Hooks do React Router: - `useParams()` lê parâmetros da URL, como o ID
em `/editar/:id`; - `useNavigate()` navega por código, por exemplo
`navigate("/tarefas")`.

Fluxo da edição: 1. rota recebe ID; 2. `useParams()` lê ID; 3. busca os
dados; 4. preenche estados; 5. `editarTarefa(id, dados)` envia as
alterações.

Sem ID, o formulário cria uma nova tarefa.

## `map()`, `filter()` e `length`

-   **`map()`** transforma cada item e retorna um array novo. Usado para
    renderizar um cartão por tarefa e atualizar um item mantendo os
    demais.
-   **`filter()`** mantém os itens que passam pela condição. Usado para
    filtrar tarefas ou retirar uma tarefa excluída da lista local.
-   **`length`** conta itens do array.

``` js
const pendentes = tarefas.filter(
  (tarefa) => tarefa.situacao === "Pendente"
);
const totalPendentes = pendentes.length;
```

## Filtro de atrasadas

O ToDo armazena Pendente, Concluida e Cancelada. Para descobrir
atrasadas: 1. converte `dataLimite` em data; 2. zera as horas para
comparar só o dia; 3. verifica se o prazo passou; 4. verifica se a
tarefa continua Pendente.

Concluídas e canceladas não são classificadas como atrasadas.

## Gráfico ApexCharts

`GraficoModal.jsx` recebe `tarefas` por props e calcula os números: -
`series`: valores numéricos; - `labels`: nomes das categorias; -
`colors`: cores; - `type="pie"`: gráfico de pizza; - `options`:
configurações de legenda e aparência.

Mantenha categorias, valores e cores na mesma ordem. Neste projeto, as
categorias exclusivas são pendentes no prazo, concluídas, canceladas e
atrasadas.

## Reconhecimento de voz

O formulário usa o hook `useVoiceRecognition`. Para alterar: 1. leia o
hook e veja como inicia o reconhecimento e entrega o texto; 2. veja onde
`TodoForm.jsx` consome esse texto; 3. descubra como o texto atualiza
campos ou seleciona participantes; 4. teste microfone e navegador.

Use os nomes reais das funções que existem no hook.

## Rotas React em `App.jsx`

`App.jsx` configura qual tela aparece para cada caminho: - `/tarefas`:
lista; - `/new`: formulário de nova tarefa; - `/editar/:id`: formulário
reutilizado para editar; - `/login`, `/register` e outras rotas de
autenticação.

`Navigate` redireciona para outra rota. A autenticação controla o acesso
a algumas páginas.

# 4. Fluxos completos

### Criar

`TodoForm.jsx` → `criarTarefa()` → `POST /tarefas` → rota → controller →
model/MongoDB → resposta.

### Listar

`TodoList.jsx` → `listarTarefas()` → `GET /tarefas` → controller/model →
resposta → `setTarefas(...)` → cartões renderizados.

### Editar

Botão em `TodoItem.jsx` → `onEdit(id)` → rota `/editar/:id` →
`TodoForm.jsx` lê ID → carrega dados → `editarTarefa(id, dados)` →
`PATCH /tarefas/:id` → backend salva.

### Excluir

Botão em `TodoItem.jsx` → `onDelete(id)` → `excluirTarefa()` →
`deletarTarefa()` → `DELETE /tarefas/:id` → backend exclui → `filter()`
remove o cartão da tela.

### Alterar situação

Select em `TodoItem.jsx` → `onSituacaoChange(id, novaSituacao)` →
`atualizarSituacao()` → `PATCH /tarefas` → resposta → `setTarefas()`
atualiza o estado.

# 5. Como investigar erros

1.  **Frontend:** `F12` → Console.
2.  **Backend:** terminal do servidor.
3.  **API:** Swagger em `/docs`, se o endpoint estiver documentado.
4.  **Banco:** confira se o documento mudou.
5.  **Estado React:** confira se a tela atualizou depois da resposta.
6.  **Imports:** procure nomes importados duas vezes.
7.  **Gráfico:** confira variáveis definidas e correspondência entre
    `labels` e `series`.

Erros frequentes: - `Identifier ... has already been declared`:
import/identificador duplicado. - Variável não definida: declarar antes
de usar. - Botão não faz nada: conferir `onClick`, prop e função do
componente pai. - Tela não atualiza: conferir `setState` e resposta da
API. - `401/403`: autenticação ou permissão. - `404`: caminho, método ou
recurso. - Gráfico branco: Console, variáveis e contagem de
rótulos/valores.

# 6. Vocabulário rápido

  Termo           Significado simples
  --------------- -------------------------------------------
  Frontend        Parte visual
  Backend         Servidor e regras
  API             Comunicação entre frontend e backend
  Endpoint/rota   Método HTTP + caminho
  Controller      Processa requisição
  Model           Interface Mongoose para documentos
  Schema          Estrutura, tipos e validações
  Documento       Registro no MongoDB
  Coleção         Conjunto de documentos
  Estado          Valor guardado pelo React
  Props           Dados/funções passados entre componentes
  Renderizar      Mostrar/atualizar interface
  Middleware      Função que intercepta/processa requisição
  JSON            Formato de dados da comunicação
  CRUD            Create, Read, Update, Delete
  Socket.IO       Comunicação em tempo real

## Dica final

Não tente decorar todos os arquivos. Entenda o caminho de uma ação e a
responsabilidade de cada camada. Em outro projeto, os nomes podem mudar,
mas esse raciocínio ajuda a encontrar onde implementar a funcionalidade.
