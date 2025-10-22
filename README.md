# 🚀 Projeto Full-Stack: CRUD Angular com Node.js e Suporte Multi-DB

Este é um projeto de estudo e demonstração de uma arquitetura Full-Stack moderna. Ele implementa operações CRUD (Criar, Ler, Atualizar, Deletar) utilizando o framework **Angular** no Frontend e o **Node.js/Express** no Backend, com suporte a dois dos bancos de dados mais populares: MySQL e PostgreSQL (utlizando as ferramentas Xampp com PhpMyAdmin e PgAdmin 4).

Angular CLI: 20.0.1
Node: 22.16.0
Package Manager: npm 10.9.2
OS: win32 x64

## ✨ Funcionalidades Principais

* **Frontend (Angular):** Interface de usuário para gerenciar uma lista de usuários.
    * Implementação completa de CRUD.
    * **Proteção de Rota (Guards):** As rotas de aplicação (`/pages/home`) são protegidas e só podem ser acessadas por usuários autenticados.
    * **Autenticação:** Tela de Login e funcionalidade de **Avatar/Sair** no topo da aplicação.
    * **Configuração de Ambiente:** Uso do `environment.ts` para gerenciar a URL da API.
* **Backend (Node.js/Express):** API RESTful que gerencia a comunicação com o banco de dados.
    * Suporte a **MySQL** (`server-mysql.js`).
    * Suporte a **PostgreSQL** (`server-postgres.js`).

## ⚙️ Tecnologias Utilizadas

**Frontend:**
* Angular (Versão: 20.0.1)
* TypeScript
* Angular Router e Guards

**Backend:**
* Node.js e Express
* CORS
* **MySQL:** `mysql2/promise`
* **PostgreSQL:** `pg-promise`

## 💻 Configuração e Instalação

Siga os passos abaixo para configurar e rodar o projeto em sua máquina local.

### Pré-requisitos

Você precisará ter instalado:

1.  **Node.js** e **npm** (ou Yarn).
2.  **Angular CLI** (`npm install -g @angular/cli`).
3.  Um servidor de banco de dados (MySQL/XAMPP ou PostgreSQL/pgAdmin4).

### 1. Configuração do Backend

1.  Navegue até a pasta `backend`:
    ```bash
    cd backend
    ```
2.  Instale as dependências do Node.js:
    ```bash
    npm install
    ```
3.  **Configuração do Banco de Dados:**
    * **Se usar MySQL:** Configure a conexão no `server-mysql.js`.
    * **Se usar PostgreSQL:** Configure a conexão no `server-postgres.js` e **crie as tabelas `login` e `usuarios`** no banco de dados "usuarios".

    **Estrutura SQL Mínima (Exemplo para Login):**
    ```sql
    CREATE TABLE usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE login (
        id SERIAL PRIMARY KEY,
        usuario VARCHAR(255) NOT NULL UNIQUE,
        pass VARCHAR(255) NOT NULL
    );
    INSERT INTO login (usuario, pass) VALUES ('admin', 'admin123');
    ```

4.  **Inicie o Servidor API** (Escolha apenas um):
    ```bash
    # Para rodar com MySQL
    node server-mysql.js

    # Para rodar com PostgreSQL
    node server-postgres.js
    ```
    O servidor estará rodando em `http://localhost:3000`.

### 2. Configuração do Frontend

1.  Navegue para a pasta raiz do Frontend (onde está o `package.json` principal):
    ```bash
    cd .. # Se você estava na pasta 'backend'
    ```
2.  Instale as dependências do Angular:
    ```bash
    npm install
    ```
3.  **Configuração de Ambiente:** O projeto usa o `environment.development.ts`. A URL da API deve ser:
    ```typescript
    // environment.development.ts
    apiUrl: 'http://localhost:3000/api', 
    ```

4.  **Inicie a Aplicação Angular:**
    ```bash
    ng serve -o
    ```
    A aplicação será aberta em seu navegador em `http://localhost:4200` e será redirecionada para o Login.

## 🔑 Acesso Padrão

* **URL:** `http://localhost:4200/components/login`
* **Credenciais de Teste:** `admin` / `admin123` (ou as credenciais que você inseriu na tabela `login`).