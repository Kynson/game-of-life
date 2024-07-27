import type { Packet } from './index';

import { Universe, CellState } from 'kernal';
import wrapDelta from './utils/delta-wrapper';

import { CELL_SIZE, CELL_FILL } from '../cell-styles';

let universe: Universe;
let universeWidth: number;
let universeHeight: number;

let universeCanvas: OffscreenCanvas;
let universeCanvasContext: OffscreenCanvasRenderingContext2D;

let previousAnimationTimestamp: number = performance.now();

let isInitialized = false;
let isPlaying = false;

function cellIndexToCellCoordinates(index: number) {
  const x = (index % universeWidth) * CELL_SIZE;
  const y = Math.floor(index / universeWidth) * CELL_SIZE;

  return {
    x,
    y,
  };
}

function renderCell(index: number) {
  const { x, y } = cellIndexToCellCoordinates(index);

  universeCanvasContext.fillStyle = CELL_FILL;
  universeCanvasContext.fillRect(x, y, CELL_SIZE, CELL_SIZE);
}

function clearCell(index: number) {
  const { x, y } = cellIndexToCellCoordinates(index);

  universeCanvasContext.clearRect(x, y, CELL_SIZE, CELL_SIZE);
}

function renderUniverse(currentTimestamp: number, once: boolean) {
  if (!isPlaying) {
    return;
  }

  if (currentTimestamp - previousAnimationTimestamp < 80) {
    requestAnimationFrame((timestamp) => {
      renderUniverse(timestamp, once);
    });
    return;
  }

  if (once) {
    isPlaying = false;
  }

  previousAnimationTimestamp = currentTimestamp;

  const { changedCellIndexes, newState, numberOfChanges } = wrapDelta(
    universe.nextGeneration(),
  );

  for (let i = 0; i < numberOfChanges; i++) {
    if ((newState[i] as CellState) === CellState.Alive) {
      renderCell(changedCellIndexes[i]);

      continue;
    }

    clearCell(changedCellIndexes[i]);
  }

  self.postMessage('tick');

  requestAnimationFrame((timestamp) => {
    renderUniverse(timestamp, once);
  });
}

function isValidInitialAliveCellIndexes(indexes: Uint32Array) {
  return (
    new Set(indexes).size === indexes.length &&
    indexes.every((index) => index < universeWidth * universeHeight)
  );
}

function initialize(
  initialAliveCellIndexes: Uint32Array,
  canvas: OffscreenCanvas,
  width: number,
  height: number,
) {
  if (isInitialized) {
    return;
  }

  universeWidth = width;
  universeHeight = height;

  // Check is only needed during development
  if (
    import.meta.env.DEV &&
    !isValidInitialAliveCellIndexes(initialAliveCellIndexes)
  ) {
    throw new Error('invalid initialAliveCellIndexes');
  }

  universe = new Universe(
    universeWidth,
    universeHeight,
    initialAliveCellIndexes,
  );
  universeCanvas = canvas;
  universeCanvasContext = universeCanvas.getContext('2d')!;

  isPlaying = true;
  requestAnimationFrame((timestamp) => {
    renderUniverse(timestamp, true);
  });

  isInitialized = true;
}

function start() {
  if (isPlaying) {
    return;
  }

  if (!isInitialized) {
    throw new Error('start called before initialization');
  }

  isPlaying = true;

  requestAnimationFrame((timestamp) => {
    renderUniverse(timestamp, false);
  });
}

function pause() {
  if (!isPlaying) {
    return;
  }

  isPlaying = false;
}

function toggleCell(x: number, y: number) {
  if (!isInitialized) {
    throw new Error('cannot toggle cell before initialization');
  }

  const index =
    Math.floor(x / CELL_SIZE) + Math.floor(y / CELL_SIZE) * universeWidth;

  universe.toggleCell(index);

  isPlaying = true;
  requestAnimationFrame((timestamp) => {
    renderUniverse(timestamp, true);
  });
}

self.addEventListener('message', ({ data }: MessageEvent<Packet>) => {
  switch (data.method) {
    case 'initialize': {
      const { initialAliveCellIndexes, canvas, universeWidth, universeHeight } =
        data.payload;
      initialize(
        initialAliveCellIndexes,
        canvas,
        universeWidth,
        universeHeight,
      );

      break;
    }
    case 'start':
      start();
      break;
    case 'pause':
      pause();
      break;
    case 'renderNextGeneration':
      isPlaying = true;
      requestAnimationFrame((timestamp) => {
        renderUniverse(timestamp, true);
      });
      break;
    case 'toggleCell': {
      const { x, y } = data.payload;
      toggleCell(x, y);

      break;
    }
  }
});

// Send a message to inform the main thread the worker is ready
self.postMessage('workerInitialized');
