#! /usr/local/bin/node

import { execSync } from 'node:child_process';

import * as log from './log.mjs';

log.info('Installing cargo and wasm-pack');
execSync(
  'curl https://sh.rustup.rs -sSf | sh -s -- -y && . "$HOME/.cargo/env" && curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh',
  { stdio: 'inherit' },
);
log.info('Done! ✨\n');

