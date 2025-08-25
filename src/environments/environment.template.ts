// Template para environment.ts - copie este arquivo e configure suas chaves
// NUNCA commite o arquivo environment.ts real no Git!

export const environment = {
  production: false,
  firebase: {
    apiKey: 'SUA_FIREBASE_API_KEY_AQUI',
    authDomain: 'seu-projeto.firebaseapp.com',
    projectId: 'seu-projeto-id',
    storageBucket: 'seu-projeto.appspot.com',
    messagingSenderId: 'seu-sender-id',
    appId: 'seu-app-id',
    measurementId: 'seu-measurement-id'
  },
  aiChatApiUrl: 'https://api.dentistas.com.br/ai',
  openaiApiKey: 'SUA_OPENAI_API_KEY_AQUI',
  openaiApiUrl: 'https://api.openai.com/v1/chat/completions',
  openaiModel: 'gpt-4.1-nano',
  ambiente: 'development',
  apiUrl: 'http://localhost:3000/api'
};
// ADICIONADO: quebra de linha final garantida abaixo
