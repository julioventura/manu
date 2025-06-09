# Dentistas

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.6.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `npm install` to install dependencies and `npm run setup` to generate
`environment.ts` before building. After that, run `ng build` to build the
project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Linting

Run `npm run lint` to check the code for formatting issues and unused variables.
<!-- Sessao de lint adicionada ao README -->

## 🔒 Configuração de Ambiente

### IMPORTANTE: Configuração das Chaves de API

1. Copie o arquivo template:
   ```bash
   cp src/environments/environment.template.ts src/environments/environment.ts
   ```

2. Configure suas chaves reais no arquivo copiado
3. NUNCA commite o arquivo `environment.ts` no Git
4. Use o arquivo `.env` para desenvolvimento local

### Variáveis de Ambiente Necessárias:

```env
FIREBASE_API_KEY=sua_chave_aqui
FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
FIREBASE_PROJECT_ID=seu_projeto_id
OPENAI_API_KEY=sk-proj-sua_chave_aqui
```

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
