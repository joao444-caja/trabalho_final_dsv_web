document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const currentUser = localStorage.getItem('logged_user');
  const API_URL = 'https://trabalho-backend-9s6a.onrender.com/api';

  // Guarda de Rotas
  if (!currentUser && currentPage !== 'login.html') {
    window.location.href = 'login.html';
    return;
  }
  if (currentUser && currentPage === 'login.html') {
    window.location.href = 'index.html';
    return;
  }

  // Preenche dados do usuário logado no Dashboard
  if (currentUser) {
    const headerUser = document.getElementById('header-username');
    const profileUser = document.getElementById('profile-username');
    const avatarInitials = document.getElementById('avatar-initials');

    if (headerUser) headerUser.textContent = currentUser;
    if (profileUser) profileUser.textContent = currentUser;
    if (avatarInitials) avatarInitials.textContent = currentUser.charAt(0).toUpperCase();
  }

  // Abas de Autenticação
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const authMsg = document.getElementById('auth-msg');

  tabLogin?.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm?.classList.remove('hidden');
    registerForm?.classList.add('hidden');
    if (authMsg) authMsg.textContent = '';
  });

  tabRegister?.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerForm?.classList.remove('hidden');
    loginForm?.classList.add('hidden');
    if (authMsg) authMsg.textContent = '';
  });

  // Cadastro de Usuário
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-user').value.trim();
    const password = document.getElementById('reg-pass').value.trim();

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (authMsg) {
        authMsg.textContent = data.message || data.error;
        authMsg.className = res.ok ? 'auth-msg success' : 'auth-msg error';
      }
      if (res.ok && tabLogin) tabLogin.click();
    } catch (err) {
      if (authMsg) {
        authMsg.textContent = 'Erro ao conectar ao servidor.';
        authMsg.className = 'auth-msg error';
      }
    }
  });

  // Login de Usuário
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-user').value.trim();
    const password = document.getElementById('login-pass').value.trim();

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('logged_user', data.username);
        window.location.href = 'index.html';
      } else if (authMsg) {
        authMsg.textContent = data.error;
        authMsg.className = 'auth-msg error';
      }
    } catch (err) {
      if (authMsg) {
        authMsg.textContent = 'Erro ao conectar ao servidor.';
        authMsg.className = 'auth-msg error';
      }
    }
  });

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('logged_user');
    window.location.href = 'login.html';
  });

  // Integracao do Chat com SQLite
  const chatForm = document.getElementById('chat-form');
  const chatBox = document.getElementById('chat-box');
  const clearBtn = document.getElementById('clear-chat-btn');
  const msgCountEl = document.getElementById('msg-count');

  async function loadMessages() {
    if (!chatBox) return;
    try {
      const res = await fetch(`${API_URL}/messages`);
      const messages = await res.json();

      chatBox.innerHTML = '';
      let userMsgCount = 0;

      messages.forEach(msg => {
        const displayText = msg.sender === 'user' ? `${msg.username}: ${msg.content}` : msg.content;
        appendMessageUI(displayText, msg.sender);
        if (msg.username === currentUser && msg.sender === 'user') userMsgCount++;
      });

      if (msgCountEl) msgCountEl.textContent = userMsgCount;
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
    }
  }

  async function saveMessage(username, content, sender) {
    try {
      await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, content, sender })
      });
    } catch (err) {
      console.error('Erro ao salvar mensagem:', err);
    }
  }

  if (chatForm) {
    loadMessages();

    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('chat-input');
      const text = input.value.trim();

      if (text) {
        input.value = '';
        appendMessageUI(`${currentUser}: ${text}`, 'user');
        await saveMessage(currentUser, text, 'user');

        const botText = `Sistema: Resposta para ${currentUser}`;
        setTimeout(async () => {
          appendMessageUI(botText, 'bot');
          await saveMessage('Sistema', botText, 'bot');
          loadMessages();
        }, 600);
      }
    });
  }

  clearBtn?.addEventListener('click', async () => {
    try {
      await fetch(`${API_URL}/messages`, { method: 'DELETE' });
      if (chatBox) chatBox.innerHTML = '<div class="message system"><p>Chat limpo.</p></div>';
      if (msgCountEl) msgCountEl.textContent = '0';
    } catch (err) {
      console.error('Erro ao limpar chat:', err);
    }
  });
});

function appendMessageUI(text, side) {
  const chatBox = document.getElementById('chat-box');
  if (!chatBox) return;
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', side);
  msgDiv.innerHTML = `<p>${text}</p>`;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}