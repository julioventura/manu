// Alteração: remoção de logs de depuração (console.log)
/*
Arquivo: scripts.js
Funcionalidade: Controla a lógica do frontend do TutFOP, incluindo login, chat, logout, alternância de ambiente e manipulação de interface.
Funções internas:
- checkTestMode(): Exibe opção de modo de teste se o parâmetro estiver na URL.
- toggleWebhookURL(): Alterna a URL do webhook entre produção e teste.
- login(): Realiza o login do usuário, valida dados e inicializa sessão.
- logout(): Realiza o logout do usuário, com confirmação.
- sair(): Limpa sessão e retorna para tela de login.
- resetConfirmButton(): Restaura o botão de login ao estado inicial.
- sendMessage(): Envia mensagem ao tutor virtual e exibe resposta.
*/

// v 3.44a

// URLs para produção e teste
const webhookURLprod = 'https://marte.cirurgia.com.br/webhook/TutFOP3';
const webhookURLTest = 'https://marte.cirurgia.com.br/webhook-test/TutFOP3';
let webhookURL = webhookURLprod;

// Limpar localStorage no carregamento da página para forçar o login sempre
// window.onload: Inicialização da página, limpa sessão, formulário e ativa modo de teste se necessário.
window.onload = function() {
  document.getElementById("loginForm").reset();  // Limpar formulário de login
  sair();
  sessionStorage.clear(); // Limpa todos os dados da sessionStorage
  checkTestMode(); 
};

// checkTestMode(): Exibe opção de modo de teste se o parâmetro estiver na URL.
function checkTestMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const modo = urlParams.get('modo');

    // Verifica se o parâmetro 'modo' tem o valor 'teste'
    if (modo === 'teste') {
        document.getElementById('testModeContainer').style.display = 'block';
    }
}

// toggleWebhookURL(): Alterna a URL do webhook entre produção e teste.
function toggleWebhookURL() {
    const testMode = document.getElementById('testMode').checked;
    webhookURL = testMode ? webhookURLTest : webhookURLprod;
}

// login(): Realiza o login do usuário, valida dados e inicializa sessão.
async function login() {
    toggleWebhookURL();  // Verificar o estado do checkbox antes do login

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    // Verificar se todos os campos estão preenchidos
    if (!nome || !email || !senha) {
        alert('Por favor, preencha todos os campos de login.');
        resetConfirmButton(); // Resetar botão
        return;
    }

    // Verificação de formato de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Por favor, insira um e-mail válido.');
        resetConfirmButton(); // Resetar botão
        return;
    }

    const confirmButton = document.getElementById("confirmButton");
    confirmButton.innerText = "Fazendo o seu login...";
    confirmButton.disabled = true;
    confirmButton.style.backgroundColor = "#bbb"; // Mudando a cor para cinza

    // Dados do formulário para enviar ao webhook do N8N com tipo 'login'
    const formData = {
        tipo: 'login',
        nome: nome,
        email: email,
        senha: senha
    };

    try {
        // Enviando os dados ao webhook e aguardando a resposta
        const response = await fetch(webhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data && data.uuid) {
            const uuid = data.uuid;
            localStorage.setItem('uuidSecao', uuid);

            // Armazenar o nome e email no localStorage
            localStorage.setItem('usuarioNome', nome);
            localStorage.setItem('usuarioEmail', email);

            // Oculta o login e exibe o chat
            document.getElementById("login-container").style.display = "none";
            document.getElementById("chat-container").style.display = "block";

            // Limpa o log do chat ao iniciar uma nova sessão
            document.getElementById("chat-log").innerHTML = "";

            // Exibe uma mensagem de boas-vindas personalizada
            const chatLog = document.getElementById("chat-log");
            const welcomeMessage = `<div class="bot-message"><strong>Tutor Virtual:</strong>${data.response}</div>`;
            chatLog.innerHTML += welcomeMessage;

            // Atualiza o footer com o nome e email do usuário logado
            const userInfo = document.getElementById("user-info");
            userInfo.innerText = `Usuário logado: ${nome} - ${email}`;
        } else {
            console.error('UUID não foi recebido. Verifique a resposta do servidor.');
            alert('Não foi possível realizar o login. Revise sua senha.');
            resetConfirmButton(); // Resetar botão
        }
    } catch (error) {
        console.error('Erro ao enviar para o webhook:', error);
        resetConfirmButton(); // Resetar botão
        alert('Erro ao realizar o login. Tente novamente mais tarde.');
    }
}

// logout(): Realiza o logout do usuário, com confirmação.
function logout() {
  const uuidSecao = localStorage.getItem('uuidSecao'); // Verifica se está logado

  // Mostra a confirmação apenas se o usuário estiver logado
  if (uuidSecao) {
      if ( document.getElementById("login-container").style.display !== "none") {
          sair();
      }
      else {
        const confirmation = confirm("Confirma sair da conversa?");
        if (confirmation) {
            sair();
        } else {
            // Se o usuário não confirmar, mantém o chat visível
            document.getElementById("chat-container").style.display = "block";
            document.getElementById("login-container").style.display = "none";
        }
      }
  } else {
      // Se não estiver logado, pode redirecionar diretamente para a tela de login
      document.getElementById("chat-container").style.display = "none";
      document.getElementById("login-container").style.display = "block";
  }
}

// sair(): Limpa sessão e retorna para tela de login.
function sair() {
  // Limpar o localStorage
  localStorage.removeItem('uuidSecao');
    
  // Ocultar o chat e mostrar o container de login
  document.getElementById("chat-container").style.display = "none";
  document.getElementById("login-container").style.display = "block";

  // Limpar o log da conversa
  document.getElementById("chat-log").innerHTML = "";

  // Resetar o botão de confirmação e limpar o formulário
  resetConfirmButton();
  document.getElementById("nome").value = "";
  document.getElementById("email").value = "";
  document.getElementById("senha").value = ""; // Limpa o campo de senha

  // Atualiza o footer para mostrar que não há usuário logado
  const userInfo = document.getElementById("user-info");
  userInfo.innerText = "Identifique-se para entrar...";
}

// resetConfirmButton(): Restaura o botão de login ao estado inicial.
function resetConfirmButton() {
    const confirmButton = document.getElementById("confirmButton");
    confirmButton.innerText = "Continuar";  // Resetando o texto
    confirmButton.disabled = false;  // Habilitando o botão
    confirmButton.style.backgroundColor = "#4CAF50"; // Retornando à cor original
}

// sendMessage(): Envia mensagem ao tutor virtual e exibe resposta.
function sendMessage() {
    toggleWebhookURL();  // Verificar o estado do checkbox antes de enviar a mensagem

    const userInput = document.getElementById("user-input").value;
    const chatLog = document.getElementById("chat-log");

    const uuidSecao = localStorage.getItem('uuidSecao');

    if (!uuidSecao) {
      alert('Sessão expirada ou inválida. Faça login novamente.');
      return;
    }

    if (!userInput.trim()) {
        alert('Por favor, insira uma mensagem.');
        document.getElementById("user-input").focus();
        return;
    }


    const userMessage = `<div class="user-message"><strong>Você:</strong> ${userInput}</div>`;
    chatLog.innerHTML += userMessage;
    document.getElementById("user-input").value = ""; // Limpa o campo de entrada
    chatLog.scrollTop = chatLog.scrollHeight; // Rola para o final do chat

    const data = {
        tipo: 'mensagem',  // Indica que esta requisição é uma mensagem
        mensagem: userInput,
        uuid: uuidSecao  // Enviando o UUID junto com a mensagem
    };

    // Desabilitar o botão enquanto a mensagem é enviada
    const sendButton = document.querySelector("button[onclick='sendMessage()']");
    sendButton.disabled = true;
    sendButton.style.backgroundColor = "#bbb"; // Cor cinza

    fetch(webhookURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        sendButton.disabled = false;
        sendButton.style.backgroundColor = "#4CAF50"; // Retorna à cor original


        if (data && data.response) {
            let formattedResponse = data.response.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
            formattedResponse = formattedResponse.replace(/\n/g, '<br>');
            const botResponse = `<div class="bot-message"><strong>Tutor Virtual:</strong> ${formattedResponse}</div>`;
            chatLog.innerHTML += botResponse;
            chatLog.scrollTop = chatLog.scrollHeight; // Rola para o final do chat
        } else {
            alert('Ocorreu um erro ao processar sua mensagem. Tente novamente.');
            console.error('Resposta não recebida. Verifique o servidor.');
        }
    })
    .catch((error) => {
        sendButton.disabled = false;
        sendButton.style.backgroundColor = "#4CAF50"; // Retorna à cor original
        console.error('Erro ao enviar para o webhook:', error);
        alert('Erro ao enviar mensagem. Tente novamente mais tarde.');
    });
}

// Permitir o envio do preenchimento ao pressionar "Enter"
// (Funcionalidade: permite nova linha no textarea ao pressionar Enter)
document.getElementById("user-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter" && !event.ctrlKey) {
        // Se apenas "Enter" for pressionado, permite que o navegador faça a ação padrão (adicionar nova linha)
        return; // Permite nova linha
    }
    // Não há necessidade do envio via Ctrl + Enter pois foi removido
});

// togglePassword(): Alterna a visualização da senha no campo de login.
const togglePassword = document.getElementById("togglePassword");
const passwordField = document.getElementById("senha");
const passwordIcon = document.getElementById("password-icon");

togglePassword.addEventListener('click', function () {
    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordField.setAttribute('type', type);

    if (type === 'password') {
        passwordIcon.classList.remove('fa-eye-slash');
        passwordIcon.classList.add('fa-eye');
    } else {
        passwordIcon.classList.remove('fa-eye');
        passwordIcon.classList.add('fa-eye-slash');
    }
});