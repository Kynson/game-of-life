import type { Packet } from './index';

import { Universe, CellState } from 'kernal';
import wrapDelta from './utils/delta-wrapper';

const CELL_SIZE = 8;
const CELL_FILL = '#edae49';

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

function isValidInitialAliveCellIndexes(
  indexes: Uint32Array,
  universeWidth: number,
  universeHeight: number,
) {
  return (
    new Set(indexes).size === indexes.length &&
    indexes.every((index) => index < universeWidth * universeHeight)
  );
}

function initialize(
  initialAliveCellIndexes: Uint32Array,
  canvas: OffscreenCanvas,
  availableWidth: number,
  availableHeight: number,
) {
  if (isInitialized) {
    return;
  }

  universeWidth = Math.floor(availableWidth / CELL_SIZE);
  universeHeight = Math.floor(availableHeight / CELL_SIZE);

  if (
    !isValidInitialAliveCellIndexes(
      initialAliveCellIndexes,
      universeWidth,
      universeHeight,
    )
  ) {
    throw new Error('invalid initialAliveCellIndexes');
  }

  canvas.width = universeWidth * CELL_SIZE;
  canvas.height = universeHeight * CELL_SIZE;

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
      const {
        initialAliveCellIndexes,
        canvas,
        availableWidth,
        availableHeight,
      } = data.payload;
      initialize(
        initialAliveCellIndexes,
        canvas,
        availableWidth,
        availableHeight,
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
