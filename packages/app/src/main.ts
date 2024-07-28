import './style.css';

import UniverseRenderer from './universe-renderer';
import { CELL_SIZE } from './cell-styles';
import getRandomUniqueValues from './utils/random-unique-values';

const MAX_NUMBER_OF_INITIAL_ALIVE_CELLS = 500;

const universeRenderer = new UniverseRenderer();

let generationCount = 0;

// ======== UI elements ========
const motionWarningOverlay: HTMLDivElement = document.querySelector(
  '#motion-warning-overlay',
)!;
const motionWarningDismissButton: HTMLButtonElement = document.querySelector(
  '#motion-warning-dismiss-button',
)!;
const loadingOverlay: HTMLDivElement =
  document.querySelector('#loading-overlay')!;

const app: HTMLElement = document.querySelector('#app')!;

const nextGenerationButton: HTMLButtonElement = document.querySelector(
  '#next-generation-button',
)!;
const playButton: HTMLButtonElement = document.querySelector('#play-button')!;
const pauseButton: HTMLButtonElement = document.querySelector('#pause-button')!;
const universeCanvas: HTMLCanvasElement =
  document.querySelector('#universe-canvas')!;
const universeCanvasContainer: HTMLDivElement = document.querySelector(
  '#universe-canvas-container',
)!;

const generationCountSpan: HTMLSpanElement =
  document.querySelector('#generation-count')!;

// ======== Helper functions ========
function computeAvailableSpace() {
  const appComputedSytle = getComputedStyle(app);
  const appPadding = parseInt(appComputedSytle.padding, 10);
  const topbarHeight = parseInt(
    appComputedSytle.getPropertyValue('--topbar-height'),
    10,
  );
  const universeCanvasBorderWidth = parseInt(
    getComputedStyle(universeCanvasContainer).borderWidth,
    10,
  );

  return {
    width: app.clientWidth - (appPadding + universeCanvasBorderWidth) * 2,
    height:
      app.clientHeight -
      (appPadding + universeCanvasBorderWidth) * 2 -
      topbarHeight,
  };
}

function windowCoordinatesToUniverseCanvasCoordinates(x: number, y: number) {
  const universeCanvasBorderWidth = parseInt(
    getComputedStyle(universeCanvas).borderWidth,
    10,
  );

  const { top, right, left, bottom } = universeCanvas.getBoundingClientRect();

  // +1 so we don't overflow the index. The canvas actually take one more pixel
  const universeCanvasTop = top + universeCanvasBorderWidth + 1;
  const universeCanvasRight = right - universeCanvasBorderWidth;
  const universeCanvasLeft = left + universeCanvasBorderWidth + 1;
  const universeCanvasBottom = bottom - universeCanvasBorderWidth;

  if (
    x < universeCanvasLeft ||
    x > universeCanvasRight ||
    y < universeCanvasTop ||
    y > universeCanvasBottom
  ) {
    return null;
  }

  return {
    x: x - universeCanvasLeft,
    y: y - universeCanvasTop,
  };
}

// ======== Event handlers ========
function handleUniverseCanvasClick({ clientX, clientY }: MouseEvent) {
  const universeCanvasCoordinates =
    windowCoordinatesToUniverseCanvasCoordinates(clientX, clientY);

  if (!universeCanvasCoordinates) {
    return;
  }

  const { x, y } = universeCanvasCoordinates;

  universeRenderer.toggleCell(x, y);
}

function handleWorkerInitialized() {
  const { width, height } = computeAvailableSpace();

  const universeWidth = Math.floor(width / CELL_SIZE);
  const universeHeight = Math.floor(height / CELL_SIZE);
  const numberOfCells = universeWidth * universeHeight;
  const numberInitialAliveCells = Math.min(
    Math.floor(numberOfCells * 0.1),
    MAX_NUMBER_OF_INITIAL_ALIVE_CELLS,
  );

  const initialAliveCellIndexes = new Uint32Array(
    getRandomUniqueValues(0, numberOfCells, numberInitialAliveCells),
  );

  universeCanvas.width = universeWidth * CELL_SIZE;
  universeCanvas.height = universeHeight * CELL_SIZE;

  universeRenderer.initialize(
    initialAliveCellIndexes,
    universeCanvas.transferControlToOffscreen(),
    universeWidth,
    universeHeight,
  );

  loadingOverlay.classList.add('hidden');
}

function handleUniverseRendererTick() {
  generationCount++;
  generationCountSpan.textContent = `0x${generationCount.toString(16)}`;
}

function handlePlayButtonClick() {
  universeRenderer.start();

  pauseButton.classList.remove('hidden');
  playButton.classList.add('hidden');
  nextGenerationButton.classList.add('hidden');
}

function handlePauseButtonClick() {
  universeRenderer.pause();

  playButton.classList.remove('hidden');
  pauseButton.classList.add('hidden');
  nextGenerationButton.classList.remove('hidden');
}

function handleNextGenerationButtonClick() {
  universeRenderer.renderNextGeneration();
}

function handleMotionWarningDismissButtonClick() {
  motionWarningOverlay.classList.add('hidden');
}

// ======== Event listeners ========
universeCanvas.addEventListener('click', handleUniverseCanvasClick);

universeRenderer.addEventListener('workerInitialized', handleWorkerInitialized);
universeRenderer.addEventListener('tick', handleUniverseRendererTick);

nextGenerationButton.addEventListener('click', handleNextGenerationButtonClick);
playButton.addEventListener('click', handlePlayButtonClick);
pauseButton.addEventListener('click', handlePauseButtonClick);

motionWarningDismissButton.addEventListener(
  'click',
  handleMotionWarningDismissButtonClick,
);