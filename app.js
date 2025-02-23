

import { BuiltInFigureModal } from "./builtinFigureModal.js";

const canvasEl = document.getElementById("main-canvas");
const iterationEl = document.getElementById("iteration-counter");
const livingCellsEl = document.getElementById("living-cells-counter");
const sliderEl = document.getElementById('timeout-slider');
const playbackBtn = document.getElementById('playback-btn');

const builtInFigureModal = new BuiltInFigureModal("#built-in-modal");

builtInFigureModal.runButton.addEventListener("click", async () => {
  const model = await builtInFigureModal.fetchAndParse();
});

/*****************************************************************************/
