use wasm_bindgen::prelude::wasm_bindgen;
use std::fmt::{ self, Display, Formatter };

/// CellState represents the state of a cell in the universe, it can be either `Dead` or `Alive`
/// It is a tagged enum, making it easier to transfer the state between Rust and JS. It also marks counting the number of alive neighbors easier.
#[wasm_bindgen]
#[repr(u8)]
#[derive(Debug, Copy, Clone, PartialEq)]
pub enum CellState {
  Dead = 0,
  Alive = 1
}

impl Display for CellState {
  fn fmt(&self, formatter: &mut Formatter<'_>) -> fmt::Result {
    write!(formatter, "{}", match self {
      CellState::Alive => '▓',
      CellState::Dead => '▒'
    })
  }
}