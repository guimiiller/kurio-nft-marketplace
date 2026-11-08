# KURIO — NFT Marketplace

Marketplace de NFTs desenvolvido como desafio técnico frontend para a Jungle Gaming.

A aplicação permite explorar uma coleção de NFTs, consultar detalhes dos ativos, gerenciar favoritos, adicionar itens ao carrinho e simular o processo completo de compra.

O projeto utiliza React, TypeScript e Vite, com foco em componentização, responsividade, organização de código, experiência do usuário e testes automatizados.

> **Nota:** Este é um projeto demonstrativo. As operações de autenticação, catálogo, carrinho e checkout utilizam dados simulados. Nenhuma transação real em blockchain é realizada.

## Tecnologias

### Interface

- React 19
- TypeScript 6
- Vite 8
- Tailwind CSS 4
- Lucide React

### Gerenciamento de dados e navegação

- TanStack Router — roteamento tipado
- TanStack Query — gerenciamento de estado assíncrono e cache
- Axios — cliente HTTP

### Simulação de serviços

- Mock Service Worker (MSW) — interceptação e simulação de requisições HTTP
- Socket.IO Client — comunicação com a camada simulada de eventos em tempo real
- Armazenamento local do navegador — persistência de dados demonstrativos

### Qualidade

- ESLint
- TypeScript
- Playwright — testes end-to-end

## Funcionalidades

### Catálogo de NFTs

- Listagem de NFTs
- Visualização de informações dos ativos
- Filtros e navegação pelo catálogo
- Página de detalhes de cada NFT
- Interface adaptada para desktop, tablet e dispositivos móveis

### Autenticação

- Cadastro de usuários
- Login
- Controle de sessão
- Proteção de funcionalidades que exigem autenticação

A autenticação é simulada e não utiliza um serviço externo de identidade.

### Favoritos

- Marcação de NFTs favoritos
- Gerenciamento de favoritos associados ao usuário

### Carrinho

- Adição de NFTs
- Atualização de quantidades
- Remoção de itens
- Respeito à disponibilidade dos ativos
- Cálculo do subtotal em ETH

### Checkout

- Revisão dos itens selecionados
- Preenchimento de dados do comprador
- Seleção de carteira para a compra simulada
- Validação do endereço informado
- Aplicação de cupom promocional
- Cálculo dos valores da compra
- Confirmação de pedido

O cupom demonstrativo `KURIO10` pode ser aplicado durante o checkout.

A seleção de carteira faz parte do fluxo simulado. Não há conexão real com MetaMask, WalletConnect ou Coinbase Wallet.

### Pedidos e perfil

- Confirmação de pedidos
- Consulta das informações de compra
- Área de perfil do usuário

### Atualizações em tempo real

O projeto inclui uma camada de eventos simulados para representar atualizações dinâmicas da aplicação.

## Arquitetura

O código está organizado por responsabilidades, separando configuração da aplicação, componentes compartilhados, funcionalidades de domínio, páginas e infraestrutura de simulação.

```text
src/
├── app/          # Configuração principal da aplicação
├── assets/       # Recursos estáticos
├── components/   # Componentes reutilizáveis
├── features/     # Funcionalidades organizadas por domínio
├── lib/          # Utilitários e infraestrutura compartilhada
├── mocks/        # Serviços e dados simulados
└── pages/        # Páginas da aplicação
```

A organização por funcionalidades facilita a manutenção, o isolamento de regras e a evolução do projeto.

## Como executar

### Pré-requisitos

- Node.js compatível com Vite 8
- npm

Recomenda-se utilizar Node.js 22.12+ ou 24+, respeitando os requisitos da versão instalada do Vite.

### 1. Clonar o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd jungle-nft-marketplace
```

Substitua `<URL_DO_REPOSITORIO>` pela URL pública do projeto no GitHub.

### 2. Instalar dependências

```bash
npm install
```

### 3. Iniciar o ambiente de desenvolvimento

```bash
npm run dev
```

Abra no navegador o endereço exibido pelo Vite no terminal.

Normalmente:

```text
http://localhost:5173
```

## API simulada

A aplicação utiliza Mock Service Worker (MSW) para simular as respostas de uma API.

Isso permite demonstrar fluxos completos sem depender de um servidor backend externo.

Os serviços simulados incluem operações relacionadas a:

- Catálogo de NFTs
- Autenticação
- Favoritos
- Carrinho
- Checkout
- Pedidos

Os dados são demonstrativos e não devem ser utilizados como mecanismo de autenticação ou persistência em produção.

## Testes automatizados

O projeto utiliza Playwright para validar os principais fluxos da aplicação.

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

```bash
npx playwright install
npx playwright test
```

Para visualizar o relatório:

```bash
npx playwright show-report
```

Na última execução local registrada durante o desenvolvimento, os 24 testes end-to-end foram aprovados.

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

## Responsividade

A interface foi desenvolvida com abordagem responsiva, contemplando:

- Navegação adaptada para dispositivos móveis
- Grid de NFTs ajustável conforme a largura da tela
- Páginas de detalhes otimizadas para diferentes dispositivos
- Carrinho e checkout responsivos
- Componentes com estados de carregamento e erro

O Figma fornecido no desafio foi utilizado como referência visual.

## Decisões técnicas

### React e TypeScript

Utilizados para criar uma interface componentizada, com tipagem estática e melhor manutenção do código.

### TanStack Router

Responsável pela organização das rotas e navegação tipada da aplicação.

### TanStack Query

Utilizado para gerenciamento de requisições, cache e estados assíncronos.

### MSW

Escolhido para permitir a implementação e validação de fluxos completos sem a necessidade de construir um backend separado para o desafio.

### Playwright

Utilizado para testar jornadas reais do usuário no navegador, incluindo autenticação, navegação e compra.

## Limitações da demonstração

Este projeto é um protótipo funcional para avaliação técnica.

- Não realiza pagamentos reais.
- Não executa transações em blockchain.
- Não conecta carteiras reais.
- Não utiliza banco de dados remoto.
- Os dados simulados dependem do ambiente do navegador.
- A autenticação demonstrativa não deve ser utilizada como solução de segurança para produção.

## Desafio técnico

Projeto desenvolvido para o desafio frontend da Jungle Gaming.

Referências:

- [Repositório do desafio](https://github.com/junglegaming/frontend-challenge)
- [Layout no Figma](https://www.figma.com/design/Ff0SksUi7UFtPWUO8kyNtw/Frontend-Challenge?node-id=0-1)

## Autor

**Guilherme Miller**

Desenvolvedor Full Stack

- [GitHub](https://github.com/guimiiller)
