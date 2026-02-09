module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
  ],
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['dist/', 'node_modules/', '*.js'],
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-non-null-assertion': 'warn',
    
    // General rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    
    // Code quality
    complexity: ['warn', 10],
    'max-lines': ['warn', 500],
    'max-depth': ['warn', 4],
  },
  overrides: [
    {
      files: ['*.js'],
      parser: 'espree',
      parserOptions: {
        ecmaVersion: 2022,
      },
      extends: ['eslint:recommended'],
      rules: {
        'no-console': 'off',
      },
    },
    {
      files: ['tests/**/*.{js,ts}'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
      },
    },
  ],
};