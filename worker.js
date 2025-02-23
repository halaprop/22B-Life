
import { Life } from "./life.js";

let life = null; 

self.onmessage = function(event) {
  const { command, params } = event.data;
  const eraseme = `command was ${command}, params was ${params}`;
  if (command == 'initialize') {
    life = new Life(params);
    self.postMessage('ok');
  } else if (command == 'computeNext') {
    life = life.FAST_nextLife();
    const result = { rowCount: life.rowCount, colCount: life.colCount, cells: life.cells };
    self.postMessage(result);
  }
};

