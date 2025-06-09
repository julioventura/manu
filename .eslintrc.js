// ESLint configuration added to enforce code quality
module.exports = {
  // Specify TypeScript parser for ESLint
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint' // Enable linting rules for TypeScript
  ],
  extends: [
    'eslint:recommended', // Base ESLint recommended rules
    'plugin:@typescript-eslint/recommended' // Recommended rules for TypeScript
  ],
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  rules: {
    indent: ['error', 2], // Enforce consistent 2-space indentation
    semi: ['error', 'always'], // Require semicolons at the end of statements
    '@typescript-eslint/no-unused-vars': ['error'] // Catch unused variables
  }
};
