// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  { ignores: ['dist/*', '.expo/*', 'src/uniwind-types.d.ts'] },
  // Bundled images and fonts are required the React Native way.
  { rules: { '@typescript-eslint/no-require-imports': ['error', { allow: ['\\.(png|jpe?g|webp|ttf)$'] }] } },
]);
