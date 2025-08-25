import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config();

// Verificar se as variáveis necessárias existem
const requiredVars = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN', 
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID',
  'FIREBASE_MEASUREMENT_ID'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn(`⚠️ Variáveis faltando no .env: ${missingVars.join(', ')}`);
  // Não pare o processo, apenas avise
}

// Verificar a chave OpenAI
if (process.env.OPENAI_API_KEY) {
  console.log('✅ Chave da API OpenAI carregada com sucesso!');
  console.log(`✅ Primeiros caracteres da chave: ${process.env.OPENAI_API_KEY.substring(0, 5)}...`);
} else {
  console.warn('⚠️ OPENAI_API_KEY não encontrada no .env');
}

// Gerar o arquivo environment.ts
const environmentContent = `// Este arquivo é gerado automaticamente pelo setup-env.mjs
// NÃO EDITE MANUALMENTE - suas alterações serão perdidas!

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "${process.env.FIREBASE_API_KEY || ''}",
    authDomain: "${process.env.FIREBASE_AUTH_DOMAIN || ''}",
    projectId: "${process.env.FIREBASE_PROJECT_ID || ''}",
    storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET || ''}",
    messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER_ID || ''}",
    appId: "${process.env.FIREBASE_APP_ID || ''}",
    measurementId: "${process.env.FIREBASE_MEASUREMENT_ID || ''}"
  },
  aiChatApiUrl: "${process.env.AI_CHAT_API_URL || 'https://api.dentistas.com.br/ai'}",
  openaiApiKey: "${process.env.OPENAI_API_KEY || ''}",
  openaiApiUrl: "${process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions'}",
  openaiModel: "${process.env.OPENAI_MODEL || 'gpt-4o-mini'}",
  ambiente: "${process.env.AMBIENTE || 'development'}",
  apiUrl: "${process.env.API_URL || 'http://localhost:3000/api'}"
};
`;

// Obter o diretório atual
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Escrever o arquivo
const envPath = path.join(__dirname, 'src', 'environments', 'environment.ts');
fs.writeFileSync(envPath, environmentContent);

console.log('✅ Arquivo environment.ts criado com sucesso!');

// Gerar também o arquivo de produção
const prodEnvironmentContent = `// Este arquivo é gerado automaticamente pelo setup-env.mjs
// NÃO EDITE MANUALMENTE - suas alterações serão perdidas!

export const environment = {
  production: true,
  firebaseConfig: {
    apiKey: "${process.env.FIREBASE_API_KEY || ''}",
    authDomain: "${process.env.FIREBASE_AUTH_DOMAIN || ''}",
    projectId: "${process.env.FIREBASE_PROJECT_ID || ''}",
    storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET || ''}",
    messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER_ID || ''}",
    appId: "${process.env.FIREBASE_APP_ID || ''}",
    measurementId: "${process.env.FIREBASE_MEASUREMENT_ID || ''}"
  },
  aiChatApiUrl: "${process.env.AI_CHAT_API_URL || 'https://api.dentistas.com.br/ai'}",
  openaiApiKey: "${process.env.OPENAI_API_KEY || ''}",
  openaiApiUrl: "${process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions'}",
  openaiModel: "${process.env.OPENAI_MODEL || 'gpt-4o-mini'}",
  ambiente: "production",
  apiUrl: "${process.env.API_URL || 'https://your-production-api.com/api'}"
};
`;

const prodEnvPath = path.join(__dirname, 'src', 'environments', 'environment.prod.ts');
fs.writeFileSync(prodEnvPath, prodEnvironmentContent);

console.log('✅ Arquivo environment.prod.ts criado com sucesso!');