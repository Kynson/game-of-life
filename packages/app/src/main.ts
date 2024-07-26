import './style.css';

import UniverseRenderer from './universe-renderer';

const universeRenderer = new UniverseRenderer();

let generationCount = 0;

// ======== UI elements ========
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
function handleDocumentClick({ clientX, clientY }: MouseEvent) {
  console.log(clientX, clientY);

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

  universeRenderer.initialize(
    new Uint32Array([250, 251, 252]),
    universeCanvas.transferControlToOffscreen(),
    width,
    height,
  );
}

function handleUniverseRendererTick() {
  generationCount++;
  generationCountSpan.innerText = `0x${generationCount.toString(16)}`;
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

// ======== Event listeners ========
document.documentElement.addEventListener('click', handleDocumentClick);

universeRenderer.addEventListener('workerInitialized', handleWorkerInitialized);
universeRenderer.addEventListener('tick', handleUniverseRendererTick);

nextGenerationButton.addEventListener('click', handleNextGenerationButtonClick);
playButton.addEventListener('click', handlePlayButtonClick);
pauseButton.addEventListener('click', handlePauseButtonClick);