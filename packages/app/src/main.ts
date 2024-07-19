import './style.css';

import { add } from 'wasm/wasm';

const calculationResult: HTMLSpanElement | null =
  document.getElementById('calculation-result');

if (calculationResult) {
  calculationResult.innerHTML = add(2, 2).toString();
}
