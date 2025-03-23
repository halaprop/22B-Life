

import { FigureModal } from "./figure-modal.js";
import { LifeConsoleGrid } from "./life-console-grid.js";
import { LifeModel } from "./life-model.js";


class LifeApp {
  constructor() {
    this.iterationEl = document.getElementById("iteration-counter");
    this.livingCellsEl = document.getElementById("living-cells-counter");
    this.fpsEl = document.getElementById('fpsEl');

    this.runID = 0;
    this.isPlaying = true;
    this.iteration = 0;
    this.sleepTimeout = 30;
    this.lastFrameTime = performance.now();
    this.sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    const figureModal = new FigureModal("#built-in-modal");
    figureModal.runButton.addEventListener('click', async () => {
      this.selectedFigure(figureModal);
    });

    const playbackBtn = document.getElementById('playback-btn');
    this.playbackIcon = playbackBtn.querySelector("i");
    playbackBtn.addEventListener('click', () => {
      this.pressedPlay();
    });

    const speedItems = document.querySelectorAll('.uk-dropdown-nav a');
    speedItems.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        this.selectedSpeed(link);
      });
    });
  }

  async selectedFigure(builtInFigureModal) {
    try {
      let model = await builtInFigureModal.fetchAndParse();
      const gridParams = {
        canvas: document.getElementById("main-canvas"),
        rowCount: model.rowCount,
        colCount: model.colCount,
        backgroundDots: false
      };
      this.grid = new LifeConsoleGrid(gridParams);
      if (this.lifeModel) {
        this.lifeModel.terminate();
      }
      this.lifeModel = new LifeModel(model.rowCount, model.colCount, model.cells);
      await this.lifeModel.init();
      this.iteration = 0;
      this.runID++;
      if (this.isPlaying) {
        this.startPlaying();
      } else {
        const livingCellCount = this.lifeModel.draw(this.grid);
        this.updatePlaybackStats(livingCellCount);  
      }
    } catch (error) {
      throw error;
    }
  }

  async startPlaying() {
    const runID = this.runID;
    const lifeModel = this.lifeModel;
    this.isPlaying = true;
    let livingCellCount = 0;
    while (this.isPlaying && runID == this.runID) {
      livingCellCount = lifeModel.draw(this.grid);
      this.updatePlaybackStats(livingCellCount);
      await lifeModel.computeNext();
      await this.sleep(this.sleepTimeout);
      this.iteration++;
    }
  }

  pressedPlay() {
    const icon = this.playbackIcon;
    if (this.isPlaying) {
      this.isPlaying = false;
      icon.classList.remove("fa-pause");
      icon.classList.add("fa-play");
    } else {
      icon.classList.remove("fa-play");
      icon.classList.add("fa-pause");
      this.startPlaying();
    }
  }

  updatePlaybackStats(livingCellCount) {
    const kFramesPerSample = 10;
    this.iterationEl.textContent = `${this.iteration} iterations`;
    this.livingCellsEl.textContent = `${livingCellCount} living`;

    if (this.iteration % kFramesPerSample == 0) {
      const now = performance.now();
      const elapsedMs = now - this.lastFrameTime;
      this.lastFrameTime = now;
      const fps = (kFramesPerSample * 1000 / elapsedMs).toFixed(1);
      this.fpsEl.textContent = `${fps} fps`;
    }
  }

  selectedSpeed(link) {
    this.sleepTimeout = parseInt(link.getAttribute('data-sleep'));
    const speedBtn = document.getElementById('speed-btn');
    speedBtn.innerHTML = link.innerHTML;
  }
}

console.log("window.navigator.hardwareConcurrency", window.navigator.hardwareConcurrency);
new LifeApp();
