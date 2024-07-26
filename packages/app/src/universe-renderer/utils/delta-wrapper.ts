import type { Delta } from 'kernal';

type WrappedDelta = Pick<Delta, 'numberOfChanges'> & {
  changedCellIndexes: Uint32Array;
  newState: Uint8Array;
};

import {
  readUint8ArrayFromWASMMemory,
  readUint32ArrayFromWASMMemory,
} from './wasm-memory';

/**
 * Wraps a raw delta class by resolving all pointers to a `TypedArray`
 */
export default function wrapDelta({
  changedCellIndexesPointer,
  newStatesPointer,
  numberOfChanges,
}: Delta): WrappedDelta {
  return {
    // changed_cell_indexes is Vec<usize>, each element is 32-bit when compiled to wasm32-unknown-unknown
    changedCellIndexes: readUint32ArrayFromWASMMemory(
      changedCellIndexesPointer,
      numberOfChanges,
    ),
    // new_state is Vec<CellState>, each element is 8-bit when compiled to wasm32-unknown-unknown
    newState: readUint8ArrayFromWASMMemory(newStatesPointer, numberOfChanges),
    numberOfChanges,
  };
}
