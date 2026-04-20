
---

# DevLapa — Projetos Integrados 2 (VIA231) — 2026/1

## 👥 Integrantes

| Nome | GitLab |
|------|--------|
| Allyson Ramos | @Allyson |
| Amanda Rezende | @Amanda |
| Clériston Lima | @Cleriston |
| Débora Neves | @Debora |

## 🎯 Problema Escolhido

> O projeto consiste no desenvolvimento de um sistema integrado para gerenciamento operacional e financeiro de estabelecimentos gastronômicos (bares e restaurantes). O sistema centraliza o controle de produtos, estoque, comandas e movimentações financeiras em uma única plataforma, substituindo processos manuais e eliminando a perda de informações.

## 🛠️ Stack Utilizada

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React, Tailwind CSS e Lucide Icons |
| **Backend** | Java 24 (Spring Boot 3) |
| **Mobile** | Android Studio (Java/Kotlin) |
| **Banco de Dados** | PostgreSQL 18.1 |
| **Segurança** | Spring Security + JWT (JSON Web Token) |
| **Hospedagem** | Render (API/DB) e Render (Frontend) |

## 🚀 Guia de Setup e Execução

### Pré-requisitos
* **Backend**: Java JDK 24 e Maven 3.9+.
* **Frontend**: Node.js 20+ e npm.
* **Banco de Dados**: PostgreSQL 18.
* **Mobile**: Android Studio (para o módulo de garçom).

### Instalação e Execução

#### 1. Backend (API)
```bash
# Entre na pasta do projeto
cd devlapa-api

# Instale as dependências e gere o build
mvn clean install 

# Execute o projeto
mvn spring-boot:run
```
*A API estará disponível em `http://localhost:8080`.*

#### 2. Frontend (Web)
```bash
# Entre na pasta do frontend
cd devlapa-front

# Instale as dependências
npm install

# Execute em modo de desenvolvimento
npm run dev
```
*O dashboard estará disponível em `http://localhost:5173`.*

## 📋 Funcionalidades Implementadas (MVP)

* **Dashboard Dinâmico**: Visualização em tempo real de vendas, ticket médio, comandas abertas e alertas de estoque baixo.
* **Fluxo de Caixa**: Listagem automática de Contas a Pagar e Receber integrada à API.
* **Gestão de Comandas**: Sistema de controle de mesas e consumo ativo.
* **Autenticação Segura**: Controle de acesso por Roles (ADMIN, GERENTE, GARCOM) via token JWT.


## 📅 Checkpoints

| CP | Data | Entrega | Status |
|----|------|---------|--------|
| CP-1 | 12/03 | Banco de Dados (SQL + ER) | OK ✅ |
| CP-2 | 26/03 | Backend (API CRUD) | OK ✅ |
| **CP-3** | **16/04** | **Integração (Frontend + API)** | **OK ✅** |
| CP-4 | 07/05 | MVP end-to-end | Em andamento |
| CP-5 | 21/05 | Hospedagem + README final | Pendente |

## 📝 Licença

Este projeto é parte da disciplina Projetos Integrados 2 — Uniube Uberlândia, 2026/1.