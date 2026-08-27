const API_URL = 'https://trabalho-backend-9s6a.onrender.com/api';
const currentUser = localStorage.getItem('chat_user');

// Redireciona se não estiver logado
if (!currentUser && (window.location.pathname.includes('chat.html') || window.location.pathname.includes('index.html'))) {
  window.location.href = 'login.html';
}

const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const userDisplay = document.getElementById('user-display');
const avatarInitial = document.getElementById('avatar-initial');
const profileNameText = document.getElementById('profile-name-text');
const logoutBtn = document.getElementById('logout-btn');
const clearChatBtn = document.getElementById('clear-chat-btn');

// Atualiza informações do usuário na tela
if (currentUser) {
  if (userDisplay) userDisplay.textContent = currentUser;
  if (profileNameText) profileNameText.textContent = currentUser;
  if (avatarInitial) avatarInitial.textContent = currentUser.charAt(0).toUpperCase();
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
    if (confirm('Tem certeza que deseja apagar todo o histórico de mensagens?')) {
      try {
        await fetch(`${API_URL}/messages`, { method: 'DELETE' });
        await loadMessages();
      } catch (err) {
        alert('Erro ao apagar histórico.');
      }
    }
  });
}

// Busca mensagens
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

// Envia mensagem
if (chatForm) {
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = chatInput.value.trim();
    if (!content) return;

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
      alert('Erro ao enviar mensagem.');
    }
  });
}

if (chatBox) {
  loadMessages();
  setInterval(loadMessages, 2000);
}