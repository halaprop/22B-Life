

import { BuiltInFigureModal } from "./builtinFigureModal.js";
import { ConsoleGrid } from "./console.js";
import { LifeModel } from "./grid.js";

console.log("window.navigator.hardwareConcurrency", window.navigator.hardwareConcurrency);

const canvasEl = document.getElementById("main-canvas");
const iterationEl = document.getElementById("iteration-counter");
const livingCellsEl = document.getElementById("living-cells-counter");
const sliderEl = document.getElementById('timeout-slider');
const playbackBtn = document.getElementById('playback-btn');

const builtInFigureModal = new BuiltInFigureModal("#built-in-modal");
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

let running = true;
let grid;
let lifeModel;

builtInFigureModal.runButton.addEventListener('click', async () => {
  if (running) running = false;
  try {
    let model = await builtInFigureModal.fetchAndParse();
    const gridParams = {
      canvas: canvasEl,
      rowCount: model.rowCount,
      colCount: model.colCount,
      // statusLineEl: document.getElementById('status-line'),
      backgroundDots: false
    };
    grid = new ConsoleGrid(gridParams);
    lifeModel = new LifeModel(model.rowCount, model.colCount, model.cells);
    await lifeModel.init();
    startRunning();
  } catch (error) {
    throw error;
  }
});

async function startRunning() {
  running = true;
  while (running) {
    lifeModel.draw(grid);
    await lifeModel.computeNext();
    await sleep(2);
  }
}

playbackBtn.addEventListener('click', () => {
  if (running) {
    running = false;
  } else {
    startRunning();
  }

})