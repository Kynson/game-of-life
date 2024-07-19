#! /usr/local/bin/node

import { execFileSync } from 'node:child_process';

import getCargoWorkspaceMembers from './getCargoWorkspaceMembers.mjs';
import * as log from './log.mjs';

const cargoWorkspaceMembers = await getCargoWorkspaceMembers().catch(
  (error) => {
    log.error(`Failed to get Cargo workspace members\n${error}`);
  },
);

log.info('Building all WASM packages...');
for (const member of cargoWorkspaceMembers) {
  log.info(`Building ${member}...`);

  try {
    execFileSync('wasm-pack', ['build', member], { stdio: 'inherit' });
  } catch (error) {
    log.error(`Failed to build WASM package ${member}\n${error}`);
    process.exit(1);
  }
}
log.info('Done! ✨\n');

log.info('Building all JS packages...');
try {
  execFileSync('npm', ['run', 'build', '--workspaces', '--if-present'], {
    stdio: 'inherit',
  });
} catch (error) {
  log.error(`Failed to build JS packages\n${error}`);
  process.exit(1);
}
log.info('Done! ✨\n');
