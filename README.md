# Game of Life
![Code style: Prettier](https://img.shields.io/badge/code_style-Prettier-blue?style=for-the-badge)
![License: MIT](https://img.shields.io/github/license/Kynson/game-of-life?style=for-the-badge)

An implemenatation of the classical simulation [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life) written in Rust. Comes with a front end written in vanilla typescript.

## Implementation Details
The core Rust implementation of the game uses a delta-based approach to improve rendering performance. Only changed cells' states are returned in each tick, minimizing the amount of data that needs to cross the Rust-JS boundary and eliminating the need of re-rendering the entire universe in each tick.

## Acknowledgement
This project is implemented by following the [Rust WASM guide](https://rustwasm.github.io/book/game-of-life/introduction.html) with some modifications. Code licensed under [MIT](https://github.com/rustwasm/book/blob/master/LICENSE).