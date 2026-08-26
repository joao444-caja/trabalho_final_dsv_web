document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('welcome-form');
  const usernameInput = document.getElementById('username');
  const userDisplay = document.getElementById('user-display');
  const nameOutput = document.getElementById('name-output');
  const resetBtn = document.getElementById('reset-btn');

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = usernameInput.value.trim();

    if (name) {
      nameOutput.textContent = name;
      form.classList.add('hidden');
      userDisplay.classList.remove('hidden');
    }
  });

  resetBtn?.addEventListener('click', () => {
    usernameInput.value = '';
    userDisplay.classList.add('hidden');
    form.classList.remove('hidden');
    usernameInput.focus();
  });
});
// Lógica do Chat (executada apenas se a tela de chat existir na página)
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatBox = document.getElementById('chat-box');

if (chatForm) {
  chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = chatInput.value.trim();

    if (text) {
      appendMessage(text, 'user');
      chatInput.value = '';

      // Simulação de resposta automática após 800ms
      setTimeout(() => {
        appendMessage(`Recebido: "${text}"`, 'bot');
      }, 800);
    }
  });
}

function appendMessage(text, side) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', side);
  
  const p = document.createElement('p');
  p.textContent = text;
  
  msgDiv.appendChild(p);
  chatBox.appendChild(msgDiv);
  
  // Rola para a mensagem mais recente
  chatBox.scrollTop = chatBox.scrollHeight;
}