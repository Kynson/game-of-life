use wasm_bindgen::prelude::wasm_bindgen;

use crate::CellState;

/// Delta represents the changes that have been made to the universe
/// It contains two parallel vectors, one for the indexes of the cells that have changed and the other for the new states of the cells
/// Fields are intentionally private to ensure data integrity
#[wasm_bindgen]
#[derive(Default, Debug)]
pub struct Delta {
  // While HashSet is a better choice for unique values, we can't transfer a HashSet to JS and order is important here
  changed_cell_indexes: Vec<usize>,
  new_states: Vec<CellState>,
  number_of_changes: usize
}

// Rust only implementation. The following functions should not be called in JS
impl Delta {
  #[must_use]
  pub fn new() -> Self {
    Self::default()
  }

  pub fn add_change(&mut self, cell_index: usize, new_state: CellState) {
    debug_assert!(!self.changed_cell_indexes.contains(&cell_index), "change for cell {cell_index} already exists");

    self.changed_cell_indexes.push(cell_index);
    self.new_states.push(new_state);
    self.number_of_changes += 1;
  }
}

// WASM getters for JS
#[wasm_bindgen]
impl Delta {
  #[wasm_bindgen(getter, js_name = changedCellIndexesPointer)]
  pub fn changed_cell_indexes(&self) -> *const usize {
    self.changed_cell_indexes.as_ptr()
  }

  #[wasm_bindgen(getter, js_name = newStatesPointer)]
  pub fn new_states(&self) -> *const CellState {
    self.new_states.as_ptr()
  }

  #[wasm_bindgen(getter, js_name = numberOfChanges)]
  pub fn number_of_changes(&self) -> usize {
    self.number_of_changes
  }
}

impl PartialEq for Delta {
  fn eq(&self, other: &Self) -> bool {
    let mut self_change_pairs = self.changed_cell_indexes
      .iter()
      .zip(self.new_states.iter())
      .collect::<Vec<_>>();
    let mut other_change_pairs = other.changed_cell_indexes
      .iter()
      .zip(other.new_states.iter())
      .collect::<Vec<_>>();
    
    // Sort the pairs by the index so that the comparison is order-independent
    self_change_pairs.sort_by_key(|pair| pair.0);
    other_change_pairs.sort_by_key(|pair| pair.0);

    self_change_pairs == other_change_pairs
    && self.number_of_changes == other.number_of_changes
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn add_change_adds_new_changes_to_delta() {
    let mut delta = Delta::new();
    delta.add_change(0, CellState::Alive);
    delta.add_change(4, CellState::Dead);

    assert_eq!(delta.changed_cell_indexes.len(), 2);
    assert_eq!(delta.new_states.len(), 2);
    assert_eq!(delta.number_of_changes, 2);

    assert_eq!(delta.changed_cell_indexes[0], 0);
    assert_eq!(delta.changed_cell_indexes[1], 4);
  
    assert_eq!(delta.new_states[0], CellState::Alive);
    assert_eq!(delta.new_states[1], CellState::Dead);
  }

  #[test]
  #[should_panic]
  fn add_change_panics_when_change_already_exists() {
    let mut delta = Delta::new();
    delta.add_change(0, CellState::Alive);
    delta.add_change(0, CellState::Dead);
  }
}