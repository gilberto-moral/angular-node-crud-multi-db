// server-postgres.js - Configure seu servidor Express e a conexão com o MySQL

const express = require('express');
const cors = require('cors');
const pgp = require('pg-promise')();

const app = express();
const port = 3000;

// Habilita o CORS para todas as origens (em produção, restrinja isso para seu frontend)
app.use(cors({
    origin: 'http://localhost:4200' // Substitua pelo domínio do seu frontend em produção
    // origin: 'https://www.impactodesigner.com.br/frontend' // Ex.: produção
}));
app.use(express.json());

// MUDANÇA AQUI: Configuração do Banco de Dados PostgreSQL
const dbConfig = {
    host: 'localhost',         // Endereço do seu banco de dados PostgreSQL
    port: 5432,                // Porta padrão do PostgreSQL (geralmente 5432)
    user: 'postgres', // Seu usuário PostgreSQL
    password: '131613', // Sua senha PostgreSQL
    database: 'usuarios' // O nome do seu banco de dados PostgreSQL
};

// MUDANÇA AQUI: Cria a instância de conexão com pg-promise
const db = pgp(dbConfig);

// MUDANÇA AQUI: Remove a função connectToDatabase separada, pgp já gerencia isso
// A conexão é estabelecida na primeira query

// Exemplo de rota GET para buscar dados 
app.get('/api/usuarios', async (req, res) => { // roda na porta http://localhost:3000/api/usuarios
    try {
        // MUDANÇA AQUI: Usa db.any para selecionar múltiplos registros
        const usuarios = await db.any('SELECT id, nome, email FROM usuarios ORDER BY nome ASC');
        res.json(usuarios);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ message: 'Erro ao buscar usuários' });
    }
});

// CRUD ------------------------------------------------------------------=>
// CREATE - Exemplo de rota POST para inserir dados
app.post('/api/usuarios', async (req, res) => { // roda na porta http://localhost:3000/api/usuarios
    const { nome, email } = req.body;
    if (!nome || !email) {
        return res.status(400).json({ message: 'Nome e email são obrigatórios.' });
    }
    try {
        // MUDANÇA AQUI: Usa db.one para inserir e retornar o ID (opcionalmente)
        // PostgreSQL usa RETURNING id para obter o ID inserido
        const novoUsuario = await db.one('INSERT INTO usuarios (nome, email) VALUES ($1, $2) RETURNING id', [nome, email]);
        res.status(201).json({ message: 'Usuário criado com sucesso!', id: novoUsuario.id });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        // MUDANÇA AQUI: Trata erro de email duplicado específico do PostgreSQL
        if (error.code === '23505' && error.constraint === 'usuarios_email_key') { // '23505' é o código de violação de unicidade
            return res.status(409).json({ message: 'Este e-mail já está sendo usado por outro usuário.' });
        }
        res.status(500).json({ message: 'Erro ao criar usuário' });
    }
});

// Exemplo de rota PUT para atualizar dados
app.put('/api/usuarios/:id', async (req, res) => {
    const userId = req.params.id;
    const { nome, email } = req.body;

    if (!nome || !email) {
        return res.status(400).json({ message: 'Nome e email são obrigatórios para atualização.' });
    }

    try {
        // MUDANÇA AQUI: Usa db.result para obter o número de linhas afetadas
        const result = await db.result('UPDATE usuarios SET nome = $1, email = $2 WHERE id = $3', [nome, email, userId]);

        if (result.rowCount === 0) { // No pg-promise, rowCount é o equivalente a affectedRows
            return res.status(404).json({ message: 'Usuário não encontrado para atualização.' });
        }

        res.status(200).json({ message: 'Usuário atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        // MUDANÇA AQUI: Trata erro de email duplicado específico do PostgreSQL
        if (error.code === '23505' && error.constraint === 'usuarios_email_key') {
            return res.status(409).json({ message: 'Este e-mail já está sendo usado por outro usuário.' });
        }
        res.status(500).json({ message: 'Erro ao atualizar usuário.' });
    }
});

// Exemplo de rota DELETE para apagar dados
app.delete('/api/usuarios/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        // MUDANÇA AQUI: Usa db.result para obter o número de linhas afetadas
        const result = await db.result('DELETE FROM usuarios WHERE id = $1', [userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        res.status(200).json({ message: 'Usuário apagado com sucesso!' });
    } catch (error) {
        console.error('Erro ao apagar usuário:', error);
        res.status(500).json({ message: 'Erro ao apagar usuário.' });
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
});

// Opcional: Adicionar tratamento de erro para a conexão com o DB
db.connect()
    .then(obj => {
        obj.done(); // success, release the connection;
        console.log('Conectado ao banco de dados PostgreSQL!');
    })
    .catch(error => {
        console.error('Erro ao conectar ao banco de dados PostgreSQL:', error.message || error);
        process.exit(1); // Sai do processo se a conexão falhar
    });

// --- ROTA PARA O LOGIN (NOVA ROTA) ---
app.post('/api/login', async (req, res) => {
    // 1. Recebe os dados do corpo da requisição
    const { usuario, pass } = req.body;

    if (!usuario || !pass) {
        return res.status(400).json({ message: 'Usuário e Senha são obrigatórios.' });
    }

    try {
        // 2. Consulta o banco de dados
        // Usamos db.oneOrNone para esperar 0 ou 1 resultado
        const user = await db.oneOrNone(
            'SELECT usuario FROM login WHERE usuario = $1 AND pass = $2', // Consulta SQL
            [usuario, pass] // Parâmetros
        );

        // 3. Verifica o resultado
        if (user) {
            // Sucesso! O usuário existe.
            res.status(200).json({ 
                message: 'Login bem-sucedido!', 
                authenticated: true,
                usuario: user.usuario // <--- CHAVE PARA O AVATAR FUNCIONAR!
            });
        } else {
            // Falha: Usuário ou senha não encontrados/inválidos
            res.status(401).json({ message: 'Usuário ou Senha inválidos.', authenticated: false });
        }
    } catch (error) {
        console.error('Erro no processo de login (PostgreSQL):', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});    