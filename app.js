

import { BuiltInFigureModal } from "./builtinFigureModal.js";
import { ConsoleGrid } from "./console.js";

// for test
import { Life } from "./life.js";

// console.log("window.navigator.hardwareConcurrency", window.navigator.hardwareConcurrency);


const canvasEl = document.getElementById("main-canvas");
const iterationEl = document.getElementById("iteration-counter");
const livingCellsEl = document.getElementById("living-cells-counter");
const sliderEl = document.getElementById('timeout-slider');
const playbackBtn = document.getElementById('playback-btn');

const builtInFigureModal = new BuiltInFigureModal("#built-in-modal");

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

builtInFigureModal.runButton.addEventListener("click", async () => {
  try {
    let model = await builtInFigureModal.fetchAndParse();
    const gridParams = {
      canvas: canvasEl,
      rowCount: model.rowCount,
      colCount: model.colCount,
      // statusLineEl: document.getElementById('status-line'),
      backgroundDots: false
    };
    const grid = new ConsoleGrid(gridParams);

    await runWorker(worker, 'initialize', model);
    while (true) {
      drawLife(grid, model);
      model = await runWorker(worker, 'computeNext');
      await sleep(20);
    }
  } catch (error) {
    console.log(error);
  }
});

/*****************************************************************************/
/*****************************************************************************/

// worker

async function runWorker(worker, command, params) {
  return new Promise((resolve, reject) => {
    worker.onmessage = (event) => {
      resolve(event.data);
    };
    worker.onerror = (error) => {
      reject(error);
    };
    worker.postMessage({ command, params });
  });
}

const worker = new Worker("./worker.js", { type: "module" });


let life = null; // this is worker code

async function TEST_runWorker(worker, command, params) {
  return new Promise((resolve, reject) => {
    // this is worker code
    if (command == 'initialize') {
      life = new Life(params);
      resolve();
    } else if (command == 'computeNext') {
      life = life.FAST_nextLife();
      resolve({ rowCount: life.rowCount, colCount: life.colCount, cells: life.cells })
    }
  });
}

/*****************************************************************************/
/*****************************************************************************/
// draw

function drawLife(grid, model) {
  grid.eraseAll();
  let totalLiving = 0;
  const colCount = model.colCount;
  for (const [key, value] of model.cells) {
    const row = Math.floor(key / colCount);
    const col = key % colCount;

    totalLiving++;
    grid.drawCharAt(row, col, '#', 'white');
  };
  return totalLiving;
}
