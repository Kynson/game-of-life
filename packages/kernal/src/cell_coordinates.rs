/// CellCoordinates is a struct that holds the coordinates information of a cell in the universe.
#[derive(Debug, Clone, Copy)]
pub struct CellCoordinates {
  pub x: usize,
  pub y: usize,
  pub cell_index: usize
}

impl CellCoordinates {
  pub fn new(x: usize, y: usize, universe_width: usize) -> Self {
    Self {
      x,
      y,
      // Precompute the cell index in the universe,
      // so that we don't have to calculate it every time when interfacing with Universe 
      cell_index: x + y * universe_width
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn new_creates_a_valid_cell_coordinates() {
    let cell_coordinates = CellCoordinates::new(1, 3, 2);

    assert_eq!(cell_coordinates.x, 1);
    assert_eq!(cell_coordinates.y, 3);
    assert_eq!(cell_coordinates.cell_index, 7);
  }
}