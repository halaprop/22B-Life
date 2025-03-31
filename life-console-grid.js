

const kBorderWidth = 1;

export class LifeConsoleGrid {
  constructor(params) {
    this.canvas = params.canvas;
    this.rowCount = params.rowCount || 20;
    this.colCount = params.colCount || 30;
    this.cellSize = params.cellSize || 16;

    this.width = this.colCount * this.cellSize;
    this.height = this.rowCount * this.cellSize;

    this.canvas.width = this.width + 2 * kBorderWidth;
    this.canvas.height = this.height + 2 * kBorderWidth;
    this.ctx = this.canvas.getContext("2d");
    
    this.eraseAll();
  }

  drawSet(set) {
    let livingCells = 0;    
    const ctx = this.ctx;
    ctx.fillStyle = 'white';
    const inset = 1;
    const insetCellSize = this.cellSize - inset * 2;

    for (let key of set) {
      livingCells++;
      const row = Math.floor(key / this.colCount);
      const col = key % this.colCount;
      const x = col * this.cellSize + kBorderWidth;
      const y = row * this.cellSize + kBorderWidth;
      ctx.fillRect(x+inset, y+inset, insetCellSize, insetCellSize);
    }
    return livingCells;
  }

  eraseAll() {
    const { ctx, width, height } = this;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "white";
    ctx.lineWidth = kBorderWidth;
    ctx.strokeRect(
      kBorderWidth / 2,
      kBorderWidth / 2,
      width + kBorderWidth,
      height + kBorderWidth
    );
  }
}
