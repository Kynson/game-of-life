import './style.css';

import { add } from 'kernal';
import { memory } from 'kernal/kernal_bg.wasm';

const calculationResult: HTMLSpanElement | null =
  document.getElementById('calculation-result');

if (calculationResult) {
  calculationResult.innerHTML = add(2, 2).toString();
}

console.log(memory);