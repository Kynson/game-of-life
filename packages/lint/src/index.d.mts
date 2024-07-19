import type { Linter } from 'eslint';

export default function generateESLintConfigurations(
  rootDirectory: string,
): Linter.FlatConfig[];
