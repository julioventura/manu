# Projeto Manu

## 🔒 Configuração de Ambiente

### IMPORTANTE: Configuração das Chaves de API

1. Copie o arquivo template:

   ```bash
   cp src/environments/environment.template.ts src/environments/environment.ts
   ```

2. Configure suas chaves reais no arquivo copiado
3. NUNCA commite o arquivo `environment.ts` no Git
4. Use o arquivo `.env` para desenvolvimento local

### Variáveis de Ambiente Necessárias

```env
FIREBASE_API_KEY=sua_chave_aqui
FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
FIREBASE_PROJECT_ID=seu_projeto_id
OPENAI_API_KEY=sk-proj-sua_chave_aqui
```

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
