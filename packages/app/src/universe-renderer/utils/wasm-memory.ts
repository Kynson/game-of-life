import { memory } from 'kernal/kernal_bg.wasm';

export function readUint8ArrayFromWASMMemory(pointer: number, length: number) {
  return new Uint8Array(memory.buffer, pointer, length);
}

export function readUint32ArrayFromWASMMemory(pointer: number, length: number) {
  return new Uint32Array(memory.buffer, pointer, length);
}
