// Este arquivo é gerado automaticamente pelo setup-env.js
// NÃO EDITE MANUALMENTE - suas alterações serão perdidas!

export const environment = {
  production: true,
  firebaseConfig: {
    apiKey: process.env['FIREBASE_API_KEY'] || '',
    authDomain: process.env['FIREBASE_AUTH_DOMAIN'] || '',
    projectId: process.env['FIREBASE_PROJECT_ID'] || '',
    storageBucket: process.env['FIREBASE_STORAGE_BUCKET'] || '',
    messagingSenderId: process.env['FIREBASE_MESSAGING_SENDER_ID'] || '',
    appId: process.env['FIREBASE_APP_ID'] || '',
    measurementId: process.env['FIREBASE_MEASUREMENT_ID'] || ''
  },
  aiChatApiUrl: process.env['AI_CHAT_API_URL'] || 'https://api.dentistas.com.br/ai',
  openaiApiKey: process.env['OPENAI_API_KEY'] || '',
  openaiApiUrl: process.env['OPENAI_API_URL'] || 'https://api.openai.com/v1/chat/completions',
  openaiModel: process.env['OPENAI_MODEL'] || 'gpt-4.1-nano',
  ambiente: 'production',
  apiUrl: process.env['API_URL'] || 'https://your-production-api.com/api'
};
