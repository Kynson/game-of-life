#! /usr/local/bin/node

import { execSync } from 'node:child_process';

import * as log from './log.mjs';

log.info('Installing cargo');
execSync(
  'curl https://sh.rustup.rs -sSf | sh -s -- -y && . "$HOME/.cargo/env"',
  { stdio: 'inherit' },
);
log.info('Done! ✨\n');

log.info('Installing wasm-pack');
execSync(
  'curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh',
  { stdio: 'inherit' },
);
log.info('Done! ✨\n');
