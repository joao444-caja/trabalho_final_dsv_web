const API_URL = 'https://trabalho-backend-9s6a.onrender.com/api';
const currentUser = localStorage.getItem('chat_user');

// Redireciona para o login se não houver usuário salvo no navegador
if (!currentUser) {
  window.location.href = 'login.html';
}

// Elementos com os IDs exatos do seu HTML
const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const headerUsername = document.getElementById('header-username');
const profileUsername = document.getElementById('profile-username');
const avatarInitials = document.getElementById('avatar-initials');
const logoutBtn = document.getElementById('logout-btn');
const clearChatBtn = document.getElementById('clear-chat-btn');

// Preenche os dados do perfil na tela
if (currentUser) {
  if (headerUsername) headerUsername.textContent = currentUser;
  if (profileUsername) profileUsername.textContent = currentUser;
  if (avatarInitials) avatarInitials.textContent = currentUser.charAt(0).toUpperCase();
}

// Botão Sair
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('chat_user');
    window.location.href = 'login.html';
  });
}

// Botão Limpar Chat
if (clearChatBtn) {
  clearChatBtn.addEventListener('click', async () => {
    if (confirm('Tem certeza que deseja apagar o histórico de mensagens?')) {
      try {
        await fetch(`${API_URL}/messages`, { method: 'DELETE' });
        await loadMessages();
      } catch (err) {
        console.error('Erro ao apagar histórico:', err);
      }
    }
  });
}

// Carrega as mensagens do banco
async function loadMessages() {
  if (!chatBox) return;

  try {
    const res = await fetch(`${API_URL}/messages`);
    const messages = await res.json();

    chatBox.innerHTML = '';

    messages.forEach(msg => {
      const msgDiv = document.createElement('div');
      const isMe = msg.username === currentUser;

      msgDiv.className = `message ${isMe ? 'sent' : 'received'}`;
      
      const senderHtml = isMe ? '' : `<small class="sender-name">${msg.username}</small>`;
      msgDiv.innerHTML = `${senderHtml}<span>${msg.content}</span>`;

      chatBox.appendChild(msgDiv);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (err) {
    console.error('Erro ao carregar mensagens:', err);
  }
}

// Envia mensagem para o banco
if (chatForm) {
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
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
}

// Inicializa a busca contínua
if (chatBox) {
  loadMessages();
  setInterval(loadMessages, 2000);
}