import antfu from '@antfu/eslint-config';

export default antfu({
  vue: true,
  typescript: true,
  // El formato lo hace Prettier (prettierrc); ESLint solo calidad/corrección
  stylistic: false,
  ignores: [
    'node_modules/**',
    '.nuxt/**',
    '.output/**',
    'dist/**',
    'coverage/**',
    'db/**',
    'prisma/**',
    '.insforge/**',
    '*.md',
  ],
  rules: {
    // Prettier decide el formato; estas reglas de vue chocan con él
    'vue/singleline-html-element-content-newline': 'off',
    'vue/html-indent': 'off',
    'vue/html-closing-bracket-newline': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/html-self-closing': 'off',
  },
});
