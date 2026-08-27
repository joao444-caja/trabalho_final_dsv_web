const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use(cors());

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error('Erro no SQLite:', err.message);
  else console.log('Conectado ao banco de dados SQLite.');
});

// Tabelas do Banco
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      content TEXT NOT NULL,
      sender TEXT NOT NULL
    )
  `);
});

// Rotas de Autenticação
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Preencha todos os campos.' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function (err) {
      if (err) return res.status(400).json({ error: 'Usuário já existe.' });
      res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
    });
  } catch {
    res.status(500).json({ error: 'Erro no servidor.' });
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'Usuário não encontrado.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Senha incorreta.' });

    res.json({ message: 'Login OK!', username: user.username });
  });
});

// Rotas de Mensagens com Logs de Diagnóstico
app.get('/api/messages', (req, res) => {
  db.all(`SELECT * FROM messages ORDER BY id ASC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao carregar mensagens.' });
    console.log(`[GET /api/messages] Retornando ${rows.length} mensagens.`);
    res.json(rows);
  });
});

app.post('/api/messages', (req, res) => {
  const { username, content, sender } = req.body;
  db.run(`INSERT INTO messages (username, content, sender) VALUES (?, ?, ?)`, [username, content, sender], function (err) {
    if (err) {
      console.error('[POST /api/messages] Erro SQLite:', err.message);
      return res.status(500).json({ error: 'Erro ao salvar mensagem.' });
    }
    console.log(`[POST /api/messages] Mensagem salva com sucesso! ID: ${this.lastID} (${username})`);
    res.status(201).json({ id: this.lastID, username, content, sender });
  });
});

app.delete('/api/messages', (req, res) => {
  db.run(`DELETE FROM messages`, [], (err) => {
    if (err) return res.status(500).json({ error: 'Erro ao limpar histórico.' });
    console.log('[DELETE /api/messages] Histórico limpo.');
    res.json({ message: 'Histórico apagado.' });
  });
});

app.listen(3000, () => console.log('Servidor executando em http://localhost:3000'));