interface InitializePayload {
  initialAliveCellIndexes: Uint32Array;
  canvas: OffscreenCanvas;
  universeWidth: number;
  universeHeight: number;
}

interface ToggleCellPayload {
  x: number;
  y: number;
}

export type Packet =
  | {
      method: 'initialize';
      payload: InitializePayload;
    }
  | {
      method: 'start';
    }
  | {
      method: 'pause';
    }
  | {
      method: 'renderNextGeneration';
    }
  | {
      method: 'toggleCell';
      payload: ToggleCellPayload;
    };

type RendererEvent = 'workerInitialized' | 'tick';

import UniverseRendererWorker from './worker?worker';

export default class UniverseRenderer extends EventTarget {
  private worker = new UniverseRendererWorker();

  constructor() {
    super();

    this.worker.addEventListener(
      'message',
      ({ data }: MessageEvent<RendererEvent>) => {
        this.dispatchRendererEvent(data);
      },
    );
  }

  private dispatchRendererEvent(event: RendererEvent) {
    super.dispatchEvent(new CustomEvent(event));
  }

  // This is a type override for addEventListener, as our code do not call removeEventListener nor dispatchEvent, the type overrides are skipped
  addEventListener(
    type: RendererEvent,
    callback: EventListenerOrEventListenerObject | null,
    options?: AddEventListenerOptions | boolean,
  ) {
    super.addEventListener(type, callback, options);
  }

  initialize(
    initialAliveCellIndexes: Uint32Array,
    canvas: OffscreenCanvas,
    universeWidth: number,
    universeHeight: number,
  ) {
    this.worker.postMessage(
      {
        method: 'initialize',
        payload: {
          universeWidth,
          universeHeight,
          initialAliveCellIndexes,
          canvas,
        },
      },
      [canvas, initialAliveCellIndexes.buffer],
    );
  }

  start() {
    this.worker.postMessage({ method: 'start' });
  }

  pause() {
    this.worker.postMessage({ method: 'pause' });
  }

  renderNextGeneration() {
    this.worker.postMessage({ method: 'renderNextGeneration' });
  }

  toggleCell(x: number, y: number) {
    this.worker.postMessage({
      method: 'toggleCell',
      payload: { x, y },
    });
  }
}
