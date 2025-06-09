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

## Configuração do Ambiente

1. Copie `.env.template` para `.env` na raiz do projeto
2. Adicione sua chave da API OpenAI **e** as variáveis do Firebase ao arquivo `.env`
   - `OPENAI_API_KEY`, `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_APP_ID` e `FIREBASE_MEASUREMENT_ID`
3. Execute `npm run setup` para gerar os arquivos de ambiente
4. Nunca comite arquivos `.env` ou `environment.ts`
5. Certifique-se de usar a versão 18 do Node.js conforme definido em `.nvmrc`
<!-- Adicionada instrução sobre a versão do Node -->

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
