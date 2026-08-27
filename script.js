const API_URL = 'https://trabalho-backend-9s6a.onrender.com/api';
const currentUser = localStorage.getItem('chat_user');

if (!currentUser && window.location.pathname.includes('chat.html')) {
  window.location.href = 'login.html';
}

const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');

async function loadMessages() {
  if (!chatBox) return;

  try {
    const res = await fetch(`${API_URL}/messages`);
    const messages = await res.json();

    chatBox.innerHTML = ''; 

    messages.forEach(msg => {
      const msgDiv = document.createElement('div');
      const isMe = msg.username === currentUser;

      // Se for meu usuário -> sent (Direita). Se for outro -> received (Esquerda)
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