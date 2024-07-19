import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/**
 * @param { string } rootDirectory
 * @returns { import('eslint').Linter.FlatConfig[] }
 */
function generateESLintConfigurations(rootDirectory) {
  return tseslint.config(
    {
      files: ['packages/**/*.ts'],
      ignores: ['packages/*/{dist,pkg}/**'],
      extends: [
        eslint.configs.recommended,
        ...tseslint.configs.strictTypeChecked,
        ...tseslint.configs.stylisticTypeChecked,
        prettier,
      ],
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir: rootDirectory,
        },
      },
    },
    {
      files: ['**/*.mjs'],
      extends: [eslint.configs.recommended],
    },
    {
      files: ['scripts/**/*.mjs'],
      languageOptions: {
        globals: globals.node,
      },
    },
  );
}

export default generateESLintConfigurations;
