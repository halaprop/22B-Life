

const kCellSize = 8;

export class LifeConsoleGrid {
  constructor(params) {
    this.canvas = params.canvas;
    this.rowCount = params.rowCount || 20;
    this.colCount = params.colCount || 30;

    this.width = this.colCount * kCellSize;
    this.height = this.rowCount * kCellSize;

    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext("2d");
    
    this.eraseAll();
  }

  drawSet(set) {
    let livingCells = 0;    
    const ctx = this.ctx;
    ctx.fillStyle = 'white';
    const inset = 1;
    const insetCellSize = kCellSize - inset * 2;

    for (let key of set) {
      livingCells++;
      const row = Math.floor(key / this.colCount);
      const col = key % this.colCount;
      const x = col * kCellSize;
      const y = row * kCellSize;
      ctx.fillRect(x+inset, y+inset, insetCellSize, insetCellSize);
    }
    return livingCells;
  }

  eraseAll() {
    const ctx = this.ctx;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, this.width, this.height);
  }
}
