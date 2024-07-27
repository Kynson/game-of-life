import { readFile } from 'node:fs/promises';

/**
 * Parse Cargo.toml and return the members of the workspace
 * @returns { Promise<string[]> } The members of the workspace
 */
async function getCargoWorkspaceMembers() {
  const normalizedCargoFile = (await readFile('Cargo.toml'))
    .toString('utf-8')
    .replaceAll(/ /g, '');

  return JSON.parse(normalizedCargoFile.match(/(?<=^members=)\[.+\]$/gm)[0]);
}

export default getCargoWorkspaceMembers;
