const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        sender VARCHAR(50) NOT NULL
      );
    `);
    console.log('Tabelas sincronizadas no PostgreSQL.');
  } catch (err) {
    console.error('Erro ao inicializar tabelas:', err.message);
  }
};
initDb();

// Autenticação
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Preencha todos os campos.' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (err) {
    res.status(400).json({ error: 'Usuário já existe.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) return res.status(400).json({ error: 'Usuário não encontrado.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Senha incorreta.' });

    res.json({ message: 'Login OK!', username: user.username });
  } catch (err) {
    res.status(500).json({ error: 'Erro no servidor.' });
  }
});

// Mensagens
app.get('/api/messages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM messages ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar mensagens.' });
  }
});

app.post('/api/messages', async (req, res) => {
  const { username, content, sender } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO messages (username, content, sender) VALUES ($1, $2, $3) RETURNING id',
      [username, content, sender]
    );
    res.status(201).json({ id: result.rows[0].id, username, content, sender });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar mensagem.' });
  }
});

app.delete('/api/messages', async (req, res) => {
  try {
    await pool.query('DELETE FROM messages');
    res.json({ message: 'Histórico apagado.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao limpar histórico.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));