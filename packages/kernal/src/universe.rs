use wasm_bindgen::prelude::wasm_bindgen;
use std::collections::HashSet;
use std::fmt::{ self, Display, Formatter };

use crate::CellState;
use crate::Delta;
use crate::CellCoordinates;

/// Universe is the main container of all cells and controls the state of the cells
#[wasm_bindgen]
#[derive(Debug)]
pub struct Universe {
  width: usize,
  height: usize,
  // Cells are represented as indexes of a 1D-array for easier interfacing with JS
  alive_cell_indexes: HashSet<usize>,
  neighbours_x_offsets: [usize; 3],
  neighbours_y_offsets: [usize; 3]
}

// Rust only implementation. The following functions should not be called in JS
impl Universe {
  #[must_use]
  fn get_cell_state(&self, coordinates: CellCoordinates) -> CellState {
    if self.alive_cell_indexes.contains(&coordinates.cell_index) {
      CellState::Alive
    } else {
      CellState::Dead
    }
  }

  #[must_use]
  fn count_alive_neighbours_of_cell(&self, coordinates: CellCoordinates) -> u8 {
    let mut number_of_neighbours = 0_u8;

    for x_offset in self.neighbours_x_offsets {
      for y_offset in self.neighbours_y_offsets {
        if x_offset == 0 && y_offset == 0 {
          continue;
        }

        let neighbour_coordinates = CellCoordinates::new(
          (coordinates.x + x_offset) % self.width,
          (coordinates.y + y_offset) % self.height,
          self.width
        );

        number_of_neighbours += self.get_cell_state(neighbour_coordinates) as u8;
      }
    }
    
    number_of_neighbours
  }
}

// Function exported to JS
// All functions uses indexes instead of coordinates for easier interface with JS
#[wasm_bindgen]
impl Universe {
  #[wasm_bindgen(constructor)]
  pub fn new(width: usize, height: usize, initial_alive_cells: Vec<usize>) -> Universe {
    let alive_cell_indexes = HashSet::from_iter(initial_alive_cells);
    // Always add width/ height so that it wraps around on the edges
    let neighbours_x_offsets = [width - 1, 0, 1];
    let neighbours_y_offsets = [height - 1, 0, 1];

    Universe {
      width,
      height,
      alive_cell_indexes,
      neighbours_x_offsets,
      neighbours_y_offsets
    }
  }

  #[wasm_bindgen(js_name = toggleCell)]
  pub fn toggle_cell(&mut self, index: usize) {
    if self.alive_cell_indexes.contains(&index) {
      self.alive_cell_indexes.remove(&index);

      return;
    } 
      
    self.alive_cell_indexes.insert(index);
  }

  #[wasm_bindgen(js_name = nextGeneration)]
  pub fn next_generation(&mut self) -> Delta {
    let mut delta = Delta::new();
    let mut new_alive_cell_indexes = self.alive_cell_indexes.clone();

    for x in 0..self.width {
      for y in 0..self.height {
        let cell_coordinates = CellCoordinates::new(x, y, self.width);
        let cell_index = cell_coordinates.cell_index;

        let number_of_neighbours = self.count_alive_neighbours_of_cell(cell_coordinates);
        let cell_state = self.get_cell_state(cell_coordinates);

        match (cell_state, number_of_neighbours) {
          (CellState::Alive, 2 | 3) => (),
          (CellState::Alive, _) => {
            delta.add_change(cell_index, CellState::Dead);
            new_alive_cell_indexes.remove(&cell_index);
          },
          (CellState::Dead, 3) => {
            delta.add_change(cell_index, CellState::Alive);
            new_alive_cell_indexes.insert(cell_index);
          },
          _ => ()
        }
      }
    }

    self.alive_cell_indexes = new_alive_cell_indexes;

    delta
  }
}

impl Display for Universe {
  fn fmt(&self, formatter: &mut Formatter<'_>) -> fmt::Result {
    for y in 0..self.height {
      for x in 0..self.width {
        let cell_coordinates = CellCoordinates::new(x, y, self.width);
        let cell_state = self.get_cell_state(cell_coordinates);

        write!(formatter, "{}", cell_state)?;
      }

      write!(formatter, "\n")?;
    }

    Ok(())
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn new_creates_a_valid_universe() {
    let width = 10;
    let height = 11;
    let initial_alive_cells = vec![1, 2];

    let universe = Universe::new(width, height, initial_alive_cells);

    assert_eq!(universe.width, width);
    assert_eq!(universe.height, height);
    assert_eq!(universe.alive_cell_indexes, HashSet::from([1, 2]));

    assert_eq!(universe.neighbours_x_offsets, [9, 0, 1]);
    assert_eq!(universe.neighbours_y_offsets, [10, 0, 1]);

    println!("Resulting universe:");
    println!("{:?}", universe);
    println!("{}", universe);
  }

  #[test]
  fn get_cell_state_returns_correct_state() {
    let width = 2;
    let height = 3;
    let initial_alive_cells = vec![1, 2];

    let universe = Universe::new(width, height, initial_alive_cells.clone());

    for y in 0..height {
      for x in 0..width {
        let cell_coordinates = CellCoordinates::new(x, y, width);
        let cell_index = cell_coordinates.cell_index;

        if initial_alive_cells.contains(&cell_index) {
          assert_eq!(universe.get_cell_state(cell_coordinates), CellState::Alive);

          continue;
        }

        assert_eq!(universe.get_cell_state(cell_coordinates), CellState::Dead);
      }
    }
  }

  #[test]
  fn count_alive_neighbours_of_cell_counts_correctly() {
    let width = 5;
    let height = 5;
    // Note: Please update the below expected results if the initial state is changed
    let initial_alive_cells = vec![4, 6, 7, 8, 20];

    let universe = Universe::new(width, height, initial_alive_cells);

    // A line of alive cells
    let left_cell_coordinates = CellCoordinates::new(1, 1, width);
    let center_cell_coordinates = CellCoordinates::new(2, 1, width);
    let right_cell_coordinates = CellCoordinates::new(3, 1, width);

    let left_corner_cell_coordinates = CellCoordinates::new(0, 0, width);

    assert_eq!(universe.count_alive_neighbours_of_cell(left_cell_coordinates), 1);
    assert_eq!(universe.count_alive_neighbours_of_cell(center_cell_coordinates), 2);
    assert_eq!(universe.count_alive_neighbours_of_cell(right_cell_coordinates), 2);

    // Index 6, 4 (wrapped), 20 (wrapped) are alive
    assert_eq!(universe.count_alive_neighbours_of_cell(left_corner_cell_coordinates), 3);
  }

  #[test]
  fn blinker_repeats_itself() {
    let width = 5;
    let height = 5;
    // Note: Please update the intermediate states if the initial state is changed
    let initial_alive_cells = vec![7, 12, 17];

    let mut universe = Universe::new(width, height, initial_alive_cells.clone());
    println!("Initial universe:");
    println!("{}", universe);

    let mut expected_delta = Delta::new();
    expected_delta.add_change(7, CellState::Dead);
    expected_delta.add_change(17, CellState::Dead);
    expected_delta.add_change(11, CellState::Alive);
    expected_delta.add_change(13, CellState::Alive);

    let delta = universe.next_generation();
    assert_eq!(delta, expected_delta);
    
    assert_eq!(universe.alive_cell_indexes, HashSet::from([11, 12, 13]));
    println!("Next generation:");
    println!("{:?}", universe);
    println!("{}", universe);

    let mut expected_delta = Delta::new();
    expected_delta.add_change(11, CellState::Dead);
    expected_delta.add_change(13, CellState::Dead);
    expected_delta.add_change(7, CellState::Alive);
    expected_delta.add_change(17, CellState::Alive);

    let delta = universe.next_generation();
    assert_eq!(delta, expected_delta);

    assert_eq!(universe.alive_cell_indexes, HashSet::from_iter(initial_alive_cells));
    println!("Next generation:");
    println!("{:?}", universe);
    println!("{}", universe);
  }

  #[test]
  fn block_is_still() {
    let width = 5;
    let height = 5;
    let initial_alive_cells = vec![6, 7, 11, 12];

    let mut universe = Universe::new(width, height, initial_alive_cells.clone());
    println!("Initial universe:");
    println!("{}", universe);

    let expected_delta = Delta::new();
    let delta = universe.next_generation();
    assert_eq!(delta, expected_delta);

    assert_eq!(universe.alive_cell_indexes, HashSet::from_iter(initial_alive_cells));
    println!("Next generation:");
    println!("{:?}", universe);
    println!("{}", universe);
  }
}