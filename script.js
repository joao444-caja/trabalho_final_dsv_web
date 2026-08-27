document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const currentUser = localStorage.getItem('logged_user');
  const usersDB = JSON.parse(localStorage.getItem('users_db') || '[]');
  let messageCounter = 0;

  // Guarda de Rotas
  if (!currentUser && currentPage !== 'login.html') {
    window.location.href = 'login.html';
    return;
  }
  if (currentUser && currentPage === 'login.html') {
    window.location.href = 'index.html';
    return;
  }

  // Preenche dados do usuário logado na interface
  if (currentUser) {
    const headerUser = document.getElementById('header-username');
    const profileUser = document.getElementById('profile-username');
    const avatarInitials = document.getElementById('avatar-initials');

    if (headerUser) headerUser.textContent = currentUser;
    if (profileUser) profileUser.textContent = currentUser;
    if (avatarInitials) avatarInitials.textContent = currentUser.charAt(0).toUpperCase();
  }

  // Lógica de Login/Cadastro
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const authMsg = document.getElementById('auth-msg');

  if (tabLogin && tabRegister) {
    tabLogin.addEventListener('click', () => {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      loginForm.classList.remove('hidden');
      registerForm.classList.add('hidden');
      authMsg.textContent = '';
    });

    tabRegister.addEventListener('click', () => {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      registerForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
      authMsg.textContent = '';
    });
  }

  registerForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('reg-user').value.trim();
    const pass = document.getElementById('reg-pass').value.trim();

    if (usersDB.some(u => u.username === user)) {
      authMsg.textContent = 'Usuário já existe!';
      authMsg.className = 'auth-msg error';
      return;
    }

    usersDB.push({ username: user, password: pass });
    localStorage.setItem('users_db', JSON.stringify(usersDB));
    authMsg.textContent = 'Conta criada com sucesso!';
    authMsg.className = 'auth-msg success';
    tabLogin.click();
  });

  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value.trim();

    const found = usersDB.find(u => u.username === user && u.password === pass);
    if (found) {
      localStorage.setItem('logged_user', user);
      window.location.href = 'index.html';
    } else {
      authMsg.textContent = 'Credenciais incorretas.';
      authMsg.className = 'auth-msg error';
    }
  });

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('logged_user');
    window.location.href = 'login.html';
  });

  // Chat Integrado + Ações Rápidas
  const chatForm = document.getElementById('chat-form');
  const clearBtn = document.getElementById('clear-chat-btn');
  const msgCountEl = document.getElementById('msg-count');

  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('chat-input');
      const text = input.value.trim();

      if (text) {
        appendMessage(`${currentUser}: ${text}`, 'user');
        input.value = '';
        messageCounter++;
        if (msgCountEl) msgCountEl.textContent = messageCounter;

        setTimeout(() => appendMessage(`Sistema: Resposta para ${currentUser}`, 'bot'), 700);
      }
    });
  }

  clearBtn?.addEventListener('click', () => {
    const chatBox = document.getElementById('chat-box');
    if (chatBox) {
      chatBox.innerHTML = '<div class="message system"><p>Chat limpo.</p></div>';
    }
  });
});

function appendMessage(text, side) {
  const chatBox = document.getElementById('chat-box');
  if (!chatBox) return;
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', side);
  msgDiv.innerHTML = `<p>${text}</p>`;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}