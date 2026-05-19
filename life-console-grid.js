const kMaxCellSize = 8;
const kMinCellSize = 1;
const kFitMargin = 1.3;

export class LifeConsoleGrid {
  constructor(params) {
    this.canvas = params.canvas;
    this.worldColCount = params.colCount;

    const container = this.canvas.parentElement;
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;

    this.ctx = this.canvas.getContext("2d");

    const fitW = Math.floor(this.canvas.width / (params.fitColCount * kFitMargin));
    const fitH = Math.floor(this.canvas.height / (params.fitRowCount * kFitMargin));
    this.cellSize = Math.max(kMinCellSize, Math.min(kMaxCellSize, fitW, fitH));

    // start view centered on world
    this.offsetX = Math.floor((params.colCount * this.cellSize - this.canvas.width) / 2);
    this.offsetY = Math.floor((params.rowCount * this.cellSize - this.canvas.height) / 2);

    this._setupPan();
    this.eraseAll();
  }

  _setupPan() {
    let dragging = false;
    let lastX, lastY;

    this.canvas.addEventListener('mousedown', e => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      this.canvas.style.cursor = 'grabbing';
    });

    this.canvas.addEventListener('mousemove', e => {
      if (!dragging) return;
      this.offsetX -= e.clientX - lastX;
      this.offsetY -= e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
    });

    const stopDrag = () => {
      dragging = false;
      this.canvas.style.cursor = 'grab';
    };
    this.canvas.addEventListener('mouseup', stopDrag);
    this.canvas.addEventListener('mouseleave', stopDrag);

    this.canvas.style.cursor = 'grab';
  }

  drawSet(set) {
    let livingCells = 0;
    const ctx = this.ctx;
    ctx.fillStyle = 'white';
    const inset = this.cellSize > 2 ? 1 : 0;
    const drawnCellSize = this.cellSize - inset * 2;
    const w = this.canvas.width;
    const h = this.canvas.height;

    for (let key of set) {
      livingCells++;
      const row = Math.floor(key / this.worldColCount);
      const col = key % this.worldColCount;
      const x = col * this.cellSize - this.offsetX;
      const y = row * this.cellSize - this.offsetY;
      if (x + this.cellSize < 0 || x > w || y + this.cellSize < 0 || y > h) continue;
      ctx.fillRect(x + inset, y + inset, drawnCellSize, drawnCellSize);
    }
    return livingCells;
  }

  eraseAll() {
    const ctx = this.ctx;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
