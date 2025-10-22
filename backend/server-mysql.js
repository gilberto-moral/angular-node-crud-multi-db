// server-mysql.js - Configure seu servidor Express e a conexão com o MySQL

const express = require('express');
const cors = require('cors'); // Middleware para habilitar o Cross-Origin Resource Sharing (CORS), essencial para que o frontend Angular possa se comunicar com o backend em um domínio diferente.
const mysql = require('mysql2/promise'); // Importa a versão com suporte a promises

const app = express(); // Inicializa o aplicativo Express
const port = 3000; // Ou qualquer porta que você preferir

// Habilita o CORS para todas as origens (em produção, restrinja isso para seu frontend)
app.use(cors({
    origin: 'http://localhost:4200' // Substitua pelo domínio do seu frontend em produção
    // origin: 'https://www.impactodesigner.com.br/frontend' // Ex.: produção
}));

// Middleware para parsear JSON no corpo das requisições
app.use(express.json());

// Configuração do Banco de Dados MySQL (assumindo que 'usuarios' e 'login' estão no mesmo DB)
const dbConfig = {
    host: 'localhost', // Endereço do seu banco de dados
    user: 'root',      // Seu usuário MySQL
    password: '', // Sua senha MySQL (VAZIO no XAMPP - Port 3306)
    database: 'usuarios' // O nome do seu banco de dados
};

let connection; // Variável para armazenar a conexão

async function connectToDatabase() {
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Conectado ao banco de dados MySQL!');
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error);
        process.exit(1); // Sai do processo se a conexão falhar
    }
}

// Chame a função para conectar ao banco de dados no início
connectToDatabase();

// --- ROTA PARA O LOGIN (ATUALIZADA) ---
app.post('/api/login', async (req, res) => {
    // MUDANÇA AQUI: Pegue 'pass' em vez de 'email' do corpo da requisição
    const { usuario, pass } = req.body;

    // MUDANÇA AQUI: Valide 'pass' em vez de 'email'
    if (!usuario || !pass) {
        return res.status(400).json({ message: 'Usuário e Senha são obrigatórios.' });
    }

    try {
        // MUDANÇA AQUI: Altere a coluna na sua query SQL de 'email' para 'pass'
        const [rows] = await connection.execute(
            'SELECT * FROM login WHERE usuario = ? AND pass = ?', // Use 'pass' aqui
            [usuario, pass] // E use 'pass' aqui
        );

        if (rows.length > 0) {
            const user = rows[0].usuario; // Pega o nome de usuário (campo 'usuario' na tabela 'login')
            res.status(200).json({ 
                message: 'Login bem-sucedido!', 
                authenticated: true, 
                usuario: user
            });
        } else {
            res.status(401).json({ message: 'Usuário ou Senha inválidos.', authenticated: false });
        }
    } catch (error) {
        console.error('Erro no processo de login:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// CRUD ------------------------------------------------------------------=>

// GET (com ordenação alfabética já aplicada)
app.get('/api/usuarios', async (req, res) => { // roda na porta http://localhost:3000/api/usuarios
    try {
        const [rows] = await connection.execute('SELECT * FROM usuarios ORDER BY nome ASC');
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ message: 'Erro ao buscar usuários' });
    }
});

// CREATE
app.post('/api/usuarios', async (req, res) => { // roda na porta http://localhost:3000/api/usuarios
    const { nome, email } = req.body;
    if (!nome || !email) {
        return res.status(400).json({ message: 'Nome e email são obrigatórios.' });
    }
    try {
        const [result] = await connection.execute('INSERT INTO usuarios (nome, email) VALUES (?, ?)', [nome, email]);
        res.status(201).json({ message: 'Usuário criado com sucesso!', id: result.insertId });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ message: 'Erro ao criar usuário' });
    }
});

// DELETE
app.delete('/api/usuarios/:id', async (req, res) => {
    const userId = req.params.id; // Pega o ID da URL

    try {
        const [result] = await connection.execute('DELETE FROM usuarios WHERE id = ?', [userId]);

        if (result.affectedRows === 0) {
            // Se affectedRows for 0, significa que nenhum usuário com esse ID foi encontrado
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        res.status(200).json({ message: 'Usuário apagado com sucesso!' });
    } catch (error) {
        console.error('Erro ao apagar usuário:', error);
        res.status(500).json({ message: 'Erro ao apagar usuário.' });
    }
});

// UPDATE
app.put('/api/usuarios/:id', async (req, res) => {
    const userId = req.params.id; // Pega o ID da URL
    const { nome, email } = req.body; // Pega os novos dados do corpo da requisição

    // Validação básica
    if (!nome || !email) {
        return res.status(400).json({ message: 'Nome e email são obrigatórios para atualização.' });
    }

    try {
        const [result] = await connection.execute(
            'UPDATE usuarios SET nome = ?, email = ? WHERE id = ?',
            [nome, email, userId]
        );

        if (result.affectedRows === 0) {
            // Se affectedRows for 0, significa que nenhum usuário com esse ID foi encontrado
            return res.status(404).json({ message: 'Usuário não encontrado para atualização.' });
        }

        res.status(200).json({ message: 'Usuário atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ message: 'Erro ao atualizar usuário.' });
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor backend node/express rodando em: http://localhost:${port}`);
});