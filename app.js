

import { BuiltInFigureModal } from "./builtinFigureModal.js";
import { LifeUI } from "./console.js";
import { LifeModel } from "./life-model.js";

console.log("window.navigator.hardwareConcurrency", window.navigator.hardwareConcurrency);

const canvasEl = document.getElementById("main-canvas");
const playbackBtn = document.getElementById('playback-btn');
const playbackIcon = playbackBtn.querySelector("i");
var speedBtn = document.getElementById('speed-btn');
const fpsEl = document.getElementById('fpsEl');
const iterationEl = document.getElementById("iteration-counter");
const livingCellsEl = document.getElementById("living-cells-counter");


const builtInFigureModal = new BuiltInFigureModal("#built-in-modal");
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

let running = true;
let iteration = 0;
let sleepTimeout = 30;
let grid;
let lifeModel;
const kFramesPerSample = 10;
let lastFrameTime = performance.now();

builtInFigureModal.runButton.addEventListener('click', async () => {
  if (running) running = false;
  try {
    let model = await builtInFigureModal.fetchAndParse();
    const gridParams = {
      canvas: canvasEl,
      rowCount: model.rowCount,
      colCount: model.colCount,
      backgroundDots: false
    };
    grid = new LifeUI(gridParams);
    lifeModel = new LifeModel(model.rowCount, model.colCount, model.cells);
    await lifeModel.init();
    iteration = 0;
    startRunning();
  } catch (error) {
    throw error;
  }
});

function updateStats(livingCellCount) {
  iterationEl.textContent = `${iteration} turns`;
  livingCellsEl.textContent = `${livingCellCount} living`;

  if (iteration % kFramesPerSample == 0) {
    const now = performance.now();
    const elapsedMs = now - lastFrameTime;
    lastFrameTime = now;
    const fps = (kFramesPerSample * 1000 / elapsedMs).toFixed(1);
    fpsEl.textContent = `${fps} fps`;
  }
}

async function startRunning() {
  running = true;
  let livingCellCount = 0;
  while (running) {
    updateStats(livingCellCount);
    livingCellCount = lifeModel.draw(grid);
    await lifeModel.computeNext();
    await sleep(sleepTimeout);
    iteration++;
  }
}

playbackBtn.addEventListener('click', () => {
  if (running) {
    running = false;
    playbackIcon.classList.remove("fa-pause");
    playbackIcon.classList.add("fa-play");
  } else {
    playbackIcon.classList.remove("fa-play");
    playbackIcon.classList.add("fa-pause");
    startRunning();
  }
});

const speedItems = document.querySelectorAll('.uk-dropdown-nav a');

speedItems.forEach(function(link) {
  link.addEventListener('click', function(e) {
    e.preventDefault(); 
    sleepTimeout = parseInt(this.getAttribute('data-sleep'));
    speedBtn.innerHTML = link.innerHTML;
  });
});
