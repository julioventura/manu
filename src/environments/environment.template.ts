// MODELO DE CONFIGURAÇÃO - NÃO CONTÉM CHAVES REAIS
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "FIREBASE_API_KEY",
    authDomain: "dentistas-com-br-2025.firebaseapp.com",
    projectId: "dentistas-com-br-2025", 
    storageBucket: "dentistas-com-br-2025.appspot.com",
    messagingSenderId: "62096953183", 
    appId: "1:62096953183:web:d23421cecbd0caebc2b0ea",
    measurementId: "G-657HTS1CNX"
  },
  aiChatApiUrl: 'https://api.dentistas.com.br/ai',
  get openaiApiKey() {
    return process.env.OPENAI_API_KEY || '';
  },
  openaiApiUrl: 'https://api.openai.com/v1/chat/completions',
  openaiModel: 'gpt-4o-mini'
};
// ADICIONADO: quebra de linha final garantida abaixo
