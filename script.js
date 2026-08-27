const API_URL = 'https://trabalho-backend-9s6a.onrender.com/api';

const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');

const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authMessage = document.getElementById('auth-message');

const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const headerUsername = document.getElementById('header-username');
const profileUsername = document.getElementById('profile-username');
const avatarInitials = document.getElementById('avatar-initials');
const logoutBtn = document.getElementById('logout-btn');
const clearChatBtn = document.getElementById('clear-chat-btn');

let messageInterval = null;

// Alterna a exibição das telas dependendo da sessão
function checkAuth() {
  const currentUser = localStorage.getItem('chat_user');
  if (currentUser) {
    authScreen.style.display = 'none';
    appScreen.style.display = 'block';
    headerUsername.textContent = currentUser;
    profileUsername.textContent = currentUser;
    avatarInitials.textContent = currentUser.charAt(0).toUpperCase();
    loadMessages();
    if (!messageInterval) {
      messageInterval = setInterval(loadMessages, 2000);
    }
  } else {
    authScreen.style.display = 'flex';
    appScreen.style.display = 'none';
    if (messageInterval) {
      clearInterval(messageInterval);
      messageInterval = null;
    }
  }
}

// Troca de Abas (Entrar / Cadastrar)
tabLogin.addEventListener('click', () => {
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  loginForm.classList.add('active');
  registerForm.classList.remove('active');
  authMessage.textContent = '';
});

tabRegister.addEventListener('click', () => {
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  registerForm.classList.add('active');
  loginForm.classList.remove('active');
  authMessage.textContent = '';
});

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('login-user').value.trim();
  const password = document.getElementById('login-pass').value.trim();

  authMessage.className = 'auth-message';
  authMessage.textContent = 'Conectando ao servidor (aguarde até 30s se estiver inativo)...';

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('chat_user', data.username);
      authMessage.textContent = '';
      checkAuth();
    } else {
      authMessage.className = 'auth-message error';
      authMessage.textContent = data.error || 'Usuário ou senha incorretos.';
    }
  } catch (err) {
    authMessage.className = 'auth-message error';
    authMessage.textContent = 'Erro ao conectar. Tente novamente em alguns segundos.';
  }
});

// Cadastro
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('reg-user').value.trim();
  const password = document.getElementById('reg-pass').value.trim();

  authMessage.className = 'auth-message';
  authMessage.textContent = 'Criando conta no servidor...';

  try {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (res.ok) {
      authMessage.className = 'auth-message success';
      authMessage.textContent = 'Conta criada! Faça login para continuar.';
      tabLogin.click();
    } else {
      authMessage.className = 'auth-message error';
      authMessage.textContent = data.error || 'Erro ao cadastrar usuário.';
    }
  } catch (err) {
    authMessage.className = 'auth-message error';
    authMessage.textContent = 'Erro ao conectar com o servidor.';
  }
});

// Sair
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('chat_user');
  checkAuth();
});

// Mensagens
async function loadMessages() {
  const currentUser = localStorage.getItem('chat_user');
  if (!currentUser) return;

  try {
    const res = await fetch(`${API_URL}/messages`);
    const messages = await res.json();

    chatBox.innerHTML = '';

    messages.forEach(msg => {
      const msgDiv = document.createElement('div');
      const senderName = msg.username || msg.sender;
      const isMe = senderName === currentUser;

      msgDiv.className = `message ${isMe ? 'sent' : 'received'}`;
      const senderHtml = isMe ? '' : `<small class="sender-name">${senderName}</small>`;
      msgDiv.innerHTML = `${senderHtml}<span>${msg.content}</span>`;

      chatBox.appendChild(msgDiv);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (err) {
    console.error('Erro ao carregar mensagens:', err);
  }
}

// Enviar Mensagem
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const currentUser = localStorage.getItem('chat_user');
  const content = chatInput.value.trim();

  if (!content || !currentUser) return;

  try {
    await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: currentUser,
        content: content,
        sender: currentUser
      })
    });

    chatInput.value = '';
    await loadMessages();
  } catch (err) {
    console.error('Erro ao enviar mensagem:', err);
  }
});

// Limpar Histórico
clearChatBtn.addEventListener('click', async () => {
  if (confirm('Tem certeza que deseja apagar o histórico?')) {
    try {
      await fetch(`${API_URL}/messages`, { method: 'DELETE' });
      await loadMessages();
    } catch (err) {
      console.error('Erro ao apagar histórico:', err);
    }
  }
});

// Inicialização
checkAuth();