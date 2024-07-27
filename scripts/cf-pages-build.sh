#! /bin/sh

curl https://sh.rustup.rs -sSf | sh -s -- -y && . "$HOME/.cargo/env"
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

node scripts/build-all.mjs


