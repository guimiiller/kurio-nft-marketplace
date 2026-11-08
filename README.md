# KURIO — NFT Marketplace

Marketplace de NFTs desenvolvido como desafio técnico frontend para a **Jungle Gaming**.

A aplicação permite explorar uma coleção de NFTs, consultar detalhes dos ativos, gerenciar favoritos, adicionar itens ao carrinho e simular o processo completo de compra.

O projeto utiliza React, TypeScript e Vite, com foco em componentização, responsividade, organização de código, experiência do usuário e testes automatizados.

### 🌐 Links do projeto

**[Acessar aplicação — Live Demo](https://kurio-nft-marketplace-steel.vercel.app/)**

**[Repositório no GitHub](https://github.com/guimiiller/kurio-nft-marketplace)**

> **Nota:** Este é um projeto demonstrativo. As operações de autenticação, catálogo, carrinho e checkout utilizam dados simulados. Nenhuma transação real em blockchain é realizada.

---

## Tecnologias

### Interface

- React 19
- TypeScript 6
- Vite 8
- Tailwind CSS 4
- Lucide React

### Gerenciamento de dados e navegação

- **TanStack Router** — roteamento tipado
- **TanStack Query** — gerenciamento de estado assíncrono e cache
- **Axios** — cliente HTTP

### Simulação de serviços

- **Mock Service Worker (MSW)** — interceptação e simulação de requisições HTTP
- **Socket.IO Client** — comunicação com a camada simulada de eventos em tempo real
- **Local Storage e Session Storage** — persistência de dados demonstrativos no navegador

### Qualidade

- ESLint
- TypeScript
- Playwright — testes end-to-end

---

## Funcionalidades

### Catálogo de NFTs

- Listagem de NFTs
- Visualização de informações dos ativos
- Busca por NFTs
- Filtros por categoria, blockchain e faixa de preço
- Ordenação dos resultados
- Paginação do catálogo
- Página de detalhes de cada NFT
- Interface adaptada para desktop, tablet e dispositivos móveis

### Autenticação

- Cadastro de usuários
- Login
- Controle de sessão
- Proteção de funcionalidades que exigem autenticação
- Separação dos dados demonstrativos por usuário

A autenticação é simulada e não utiliza um serviço externo de identidade.

### Favoritos

- Marcação de NFTs favoritos
- Gerenciamento de favoritos associados ao usuário
- Consulta dos NFTs favoritos

### Carrinho

- Adição de NFTs
- Atualização de quantidades
- Remoção de itens
- Respeito à disponibilidade dos ativos
- Cálculo do subtotal em ETH

### Checkout

- Revisão dos itens selecionados
- Preenchimento dos dados do comprador
- Seleção de carteira para a compra simulada
- Validação do endereço Ethereum informado
- Aplicação de cupom promocional
- Cálculo dos valores da compra
- Validação das informações antes da finalização
- Confirmação do pedido

**Cupom demonstrativo:** `KURIO10`

A seleção de carteira faz parte do fluxo simulado. Não há conexão real com MetaMask, WalletConnect ou Coinbase Wallet.

### Pedidos e perfil

- Confirmação de pedidos
- Consulta das informações da compra
- Área de perfil do usuário
- Edição das informações pessoais
- Gerenciamento de informações de carteiras

### Atualizações em tempo real

O projeto inclui uma camada de eventos simulados para representar atualizações dinâmicas da aplicação, sem depender de uma infraestrutura externa de eventos.

---

## Arquitetura

O código está organizado por responsabilidades, separando configuração da aplicação, componentes compartilhados, funcionalidades de domínio, páginas e infraestrutura de simulação.

```text
src/
├── app/          # Configuração principal, providers e rotas
├── assets/       # Recursos estáticos
├── components/   # Componentes reutilizáveis
├── features/     # Funcionalidades organizadas por domínio
├── lib/          # Utilitários e infraestrutura compartilhada
├── mocks/        # Serviços e dados simulados
└── pages/        # Páginas da aplicação
```

A organização por funcionalidades facilita a manutenção, o isolamento de regras e a evolução do projeto.

### Principais decisões de arquitetura

**Separação por domínio**

As funcionalidades são organizadas em módulos, como autenticação, catálogo, carrinho, checkout e perfil.

**Camada de acesso a dados**

O consumo de dados utiliza Axios e TanStack Query, separando as requisições HTTP da interface.

**Simulação de backend**

O MSW intercepta as requisições e fornece respostas demonstrativas, permitindo desenvolver e testar os fluxos sem um servidor externo.

**Roteamento tipado**

O TanStack Router organiza a navegação, os parâmetros de rota e os filtros da aplicação.

---

## Como executar localmente

### Pré-requisitos

- Node.js compatível com Vite 8
- npm

Recomenda-se utilizar **Node.js 22.12+ ou 24+**, respeitando os requisitos da versão instalada do Vite.

### 1. Clonar o repositório

```bash
git clone https://github.com/guimiiller/kurio-nft-marketplace.git
cd kurio-nft-marketplace
```

### 2. Instalar as dependências

```bash
npm install
```

### 3. Configurar as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_ENABLE_MOCKS=true
```

Essa variável habilita o Mock Service Worker, responsável por simular as requisições HTTP utilizadas pela aplicação.

O arquivo `.env.local` não deve ser versionado.

### 4. Iniciar o ambiente de desenvolvimento

```bash
npm run dev
```

Acesse o endereço exibido pelo Vite no terminal.

Normalmente:

http://localhost:5173

---

## API simulada

A aplicação utiliza **Mock Service Worker (MSW)** para simular as respostas de uma API.

Isso permite demonstrar fluxos completos sem depender de um servidor backend externo.

Os serviços simulados incluem operações relacionadas a:

- Catálogo de NFTs
- Autenticação
- Favoritos
- Carrinho
- Checkout
- Pedidos
- Perfil do usuário

### Persistência

Os dados demonstrativos são armazenados no ambiente do navegador, utilizando mecanismos como Local Storage e Session Storage.

Essa abordagem permite simular a continuidade de determinados fluxos durante a utilização da aplicação.

**Importante:** os dados não são compartilhados entre navegadores ou dispositivos e não representam uma persistência de backend real.

A autenticação e os serviços simulados não devem ser utilizados como mecanismos de segurança ou persistência em um sistema de produção real.

---

## Testes automatizados

O projeto utiliza **Playwright** para validar os principais fluxos da aplicação.

Os testes estão organizados em três grupos:

```text
tests/e2e/
├── auth.spec.ts
├── catalog.spec.ts
└── checkout.spec.ts
```

### Cenários cobertos

**Autenticação**

- Restrição de acesso ao carrinho sem login
- Cadastro e login de usuário
- Alternância de visibilidade da senha

**Catálogo**

- Carregamento da página inicial
- Navegação para detalhes de NFT
- Ausência de rolagem horizontal indesejada

**Compra**

- Adição de NFT ao carrinho
- Aplicação de cupom
- Finalização de pedido

Os cenários são executados em três configurações de viewport:

- Desktop
- Tablet
- Mobile

### Executar os testes

Instale os navegadores necessários:

```bash
npx playwright install
```

Execute os testes:

```bash
npx playwright test
```

Para visualizar o relatório:

```bash
npx playwright show-report
```

### Resultado da última execução local

**24 testes aprovados de 24 executados.**

Os testes validaram os principais fluxos em desktop, tablet e mobile.

---

## Verificações de qualidade

### TypeScript

```bash
npx tsc --noEmit
```

### ESLint

```bash
npm run lint
```

### Build de produção

```bash
npm run build
```

### Pré-visualização do build

```bash
npm run preview
```

O build gera os arquivos estáticos na pasta `dist/`.

### Resultados da validação final

| Verificação                  | Resultado                      |
| ---------------------------- | ------------------------------ |
| ESLint                       | Aprovado — sem erros ou avisos |
| TypeScript                   | Aprovado                       |
| Build de produção            | Aprovado                       |
| Playwright                   | 24/24 testes aprovados         |
| Deploy na Vercel             | Realizado                      |
| Checkout na versão publicada | Validado manualmente           |

---

## Responsividade

A interface foi desenvolvida com abordagem responsiva, contemplando:

- Navegação adaptada para dispositivos móveis
- Grid de NFTs ajustável conforme a largura da tela
- Busca e filtros adaptados para mobile
- Páginas de detalhes otimizadas para diferentes dispositivos
- Carrinho e checkout responsivos
- Componentes com estados de carregamento e erro

O Figma fornecido no desafio foi utilizado como referência visual para a implementação.

---

## Decisões técnicas

### React e TypeScript

Utilizados para criar uma interface componentizada, com tipagem estática, maior previsibilidade e melhor manutenção do código.

### TanStack Router

Responsável pela organização das rotas, navegação tipada e gerenciamento dos parâmetros de busca do catálogo.

### TanStack Query

Utilizado para gerenciamento de requisições, cache e estados assíncronos, incluindo carregamento e tratamento de erros.

### MSW

Escolhido para permitir a implementação e validação de fluxos completos sem a necessidade de construir um backend separado para o desafio.

### Tailwind CSS

Utilizado para estilização da interface, responsividade e consistência visual dos componentes.

### Playwright

Utilizado para testar jornadas reais do usuário no navegador, incluindo autenticação, navegação e compra.

---

## Deploy

A aplicação está publicada na **Vercel**.

**URL:** https://kurio-nft-marketplace-steel.vercel.app/

### Configurações de publicação

| Configuração       | Valor           |
| ------------------ | --------------- |
| Plataforma         | Vercel          |
| Framework          | Vite            |
| Build Command      | `npm run build` |
| Output Directory   | `dist`          |
| Branch de produção | `main`          |

### Variável de ambiente

Para habilitar a API simulada na Vercel:

```env
VITE_ENABLE_MOCKS=true
```

A variável deve estar configurada no ambiente de produção antes da geração do build.

### Roteamento

O projeto utiliza um arquivo `vercel.json` para configurar o comportamento das rotas da aplicação.

Isso permite acessar diretamente páginas como:

- `/nft/1`
- `/cart`
- `/checkout`
- `/profile`
- `/favorites`

---

## Limitações da demonstração

Este projeto é um protótipo funcional desenvolvido para avaliação técnica.

- Não realiza pagamentos reais.
- Não executa transações em blockchain.
- Não conecta carteiras reais.
- Não utiliza banco de dados remoto.
- Os dados simulados dependem do ambiente do navegador.
- A autenticação demonstrativa não deve ser utilizada como solução de segurança para produção.
- As atualizações em tempo real são simuladas.
- O endereço Ethereum informado no checkout é utilizado apenas para validação demonstrativa.

O objetivo é demonstrar a implementação frontend e a integração dos principais fluxos de um marketplace de NFTs.

---

## Desafio técnico

Projeto desenvolvido para o desafio frontend da **Jungle Gaming**.

### Referências

- [Repositório do desafio](https://github.com/junglegaming/frontend-challenge)
- [Layout de referência no Figma](https://www.figma.com/design/Ff0SksUi7UFtPWUO8kyNtw/Frontend-Challenge?node-id=0-1)

---

## Autor

**Guilherme Miller**

Desenvolvedor Full Stack

- [GitHub](https://github.com/guimiiller)
- [KURIO — Live Demo](https://kurio-nft-marketplace-steel.vercel.app/)
