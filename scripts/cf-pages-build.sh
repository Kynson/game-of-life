#! /bin/sh

echo "\x1b[36m[INFO]:\x1b[0m Installing Rust and wasm-pack"

curl https://sh.rustup.rs -sSf | sh -s -- -y && . "$HOME/.cargo/env"
if [ $? -ne 0 ]; then
  echo "\x1b[31m[ERROR]:\x1b[0m Rust installation failed!"
  exit 1
fi

curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
if [ $? -ne 0 ]; then
  echo "\x1b[31m[ERROR]:\x1b[0m wasm-pack installation failed!"
  exit 1
fi

node scripts/build-all.mjs


